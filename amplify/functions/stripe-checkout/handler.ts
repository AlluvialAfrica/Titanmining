import Stripe from 'stripe';

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

function respond(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

export const handler = async (event: any) => {
  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return respond(200, {});
  }

  let body: any;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return respond(400, { success: false, error: 'Invalid JSON body' });
  }

  const { paymentMethodId, plan, email, orgName } = body;

  // Input validation
  if (!paymentMethodId || typeof paymentMethodId !== 'string' || paymentMethodId.length > 255) {
    return respond(400, { success: false, error: 'Invalid payment method ID' });
  }
  if (!plan || !PLANS[plan]) {
    return respond(400, { success: false, error: 'Invalid plan. Must be "monthly" or "annual".' });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respond(400, { success: false, error: 'Invalid email address' });
  }
  if (!orgName || typeof orgName !== 'string' || orgName.length > 200) {
    return respond(400, { success: false, error: 'Invalid organization name' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY not configured');
    return respond(500, { success: false, error: 'Payment service not configured' });
  }

  const stripe = new Stripe(stripeKey);
  const selectedPlan = PLANS[plan];

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
      return respond(200, {
        success: false,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id,
      });
    }

    console.log(`Subscription created for org "${orgName}": ${subscription.id}`);
    return respond(200, {
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
      status: subscription.status,
    });
  } catch (err: any) {
    console.error('Stripe payment processing failed:', err.type || err.message);
    return respond(400, {
      success: false,
      error: err.type === 'StripeCardError'
        ? err.message
        : 'Payment processing failed. Please try again.',
    });
  }
};
