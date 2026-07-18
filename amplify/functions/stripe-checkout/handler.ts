import Stripe from 'stripe';

/**
 * Structured audit log for payment events (CloudWatch Insights searchable).
 */
function auditLog(event: string, data: Record<string, unknown>) {
  console.log(JSON.stringify({
    audit: true,
    event,
    timestamp: new Date().toISOString(),
    ...data,
  }));
}

const PLANS: Record<string, { amount: number; interval: 'month' | 'year'; name: string }> = {
  monthly: { amount: 50000, interval: 'month', name: 'Alluvial Site Manager - Monthly' },
  annual: { amount: 480000, interval: 'year', name: 'Alluvial Site Manager - Annual' },
};

async function findOrCreateProduct(stripe: Stripe, name: string): Promise<string> {
  const products = await stripe.products.search({ query: `name:"${name}"` });
  if (products.data.length > 0) {
    return products.data[0].id;
  }
  const product = await stripe.products.create({ name });
  return product.id;
}

async function findOrCreatePrice(
  stripe: Stripe,
  productId: string,
  amount: number,
  interval: 'month' | 'year',
): Promise<string> {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    type: 'recurring',
    limit: 10,
  });
  const match = prices.data.find(
    (p) => p.unit_amount === amount && p.recurring?.interval === interval && p.currency === 'usd',
  );
  if (match) return match.id;

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amount,
    currency: 'usd',
    recurring: { interval },
  });
  return price.id;
}

// Allowed origins for CORS (production domain + localhost for dev)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://main.d29qwdlmuy3blg.amplifyapp.com,http://localhost:5173').split(',');

function getOrigin(event: any): string {
  return event.headers?.origin || event.headers?.Origin || '';
}

function respond(statusCode: number, body: any, origin?: string) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

export const handler = async (event: any) => {
  const origin = getOrigin(event);

  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return respond(200, {}, origin);
  }

  // Reject requests from unknown origins in production
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    console.warn(`Rejected request from disallowed origin: ${origin}`);
    return respond(403, { success: false, error: 'Forbidden' }, origin);
  }

  let body: any;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return respond(400, { success: false, error: 'Invalid JSON body' }, origin);
  }

  const { paymentMethodId, plan, email, orgName } = body;

  // Input validation
  if (!paymentMethodId || typeof paymentMethodId !== 'string' || paymentMethodId.length > 255) {
    return respond(400, { success: false, error: 'Invalid payment method ID' }, origin);
  }
  if (!plan || !PLANS[plan]) {
    return respond(400, { success: false, error: 'Invalid plan. Must be "monthly" or "annual".' }, origin);
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respond(400, { success: false, error: 'Invalid email address' }, origin);
  }
  if (!orgName || typeof orgName !== 'string' || orgName.length > 200) {
    return respond(400, { success: false, error: 'Invalid organization name' }, origin);
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY not configured');
    return respond(500, { success: false, error: 'Payment service not configured' }, origin);
  }

  const stripe = new Stripe(stripeKey);
  const selectedPlan = PLANS[plan];

  auditLog('payment.initiated', { email, orgName, plan, amount: selectedPlan.amount });

  try {
    // 1. Create or retrieve customer
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    let customer: Stripe.Customer;

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        name: orgName,
        metadata: { orgName },
      });
    }

    // 2. Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // 3. Find or create product and price
    const productId = await findOrCreateProduct(stripe, selectedPlan.name);
    const priceId = await findOrCreatePrice(stripe, productId, selectedPlan.amount, selectedPlan.interval);

    // 4. Create a subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    // Extract payment intent from the expanded invoice
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = (invoice as any).payment_intent as Stripe.PaymentIntent | null;

    if (paymentIntent && paymentIntent.status === 'requires_action') {
      auditLog('payment.requires_action', {
        email, orgName, plan,
        subscriptionId: subscription.id,
        paymentIntentId: paymentIntent.id,
      });
      return respond(200, {
        success: false,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id,
      }, origin);
    }

    auditLog('payment.success', {
      email, orgName, plan,
      subscriptionId: subscription.id,
      customerId: customer.id,
      amount: selectedPlan.amount,
    });
    return respond(200, {
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
      status: subscription.status,
    }, origin);
  } catch (err: any) {
    auditLog('payment.failed', {
      email, orgName, plan,
      errorType: err.type || 'unknown',
      errorMessage: err.message || 'unknown',
    });
    console.error('Stripe payment processing failed:', err.type || err.message);
    return respond(400, {
      success: false,
      error: err.type === 'StripeCardError'
        ? err.message
        : 'Payment processing failed. Please try again.',
    }, origin);
  }
};
