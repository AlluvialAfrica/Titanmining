import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createHmac } from 'crypto';

/**
 * Validate Twilio request signature to ensure webhook requests come from Twilio.
 * See: https://www.twilio.com/docs/usage/security#validating-requests
 */
function validateTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  // Build validation string: URL + sorted params key/value concatenation
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }

  const computed = createHmac('sha1', authToken)
    .update(data, 'utf-8')
    .digest('base64');

  return computed === signature;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Received WhatsApp Webhook event:', event.httpMethod, event.path);

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!verifyToken) {
    console.error('WHATSAPP_VERIFY_TOKEN not configured');
    return { statusCode: 500, body: 'Server misconfigured' };
  }

  // Verify GET webhook challenge for webhook registration
  if (event.httpMethod === 'GET') {
    const queryParams = event.queryStringParameters || {};
    const mode = queryParams['hub.mode'];
    const token = queryParams['hub.verify_token'];
    const challenge = queryParams['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verified successfully.');
        // Sanitize challenge to prevent response injection (alphanumeric + hyphens only)
        const sanitizedChallenge = (challenge || 'OK').replace(/[^a-zA-Z0-9_\-]/g, '');
        return {
          statusCode: 200,
          body: sanitizedChallenge,
        };
      }
      return {
        statusCode: 403,
        body: 'Forbidden',
      };
    }
  }

  // Handle incoming POST events (messages)
  try {
    const rawBody = event.body || '{}';
    // Reject excessively large payloads (100KB limit)
    if (rawBody.length > 102400) {
      console.warn('Webhook body too large, rejecting');
      return { statusCode: 413, body: 'Payload too large' };
    }

    // Validate Twilio request signature if auth token is configured
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioSignature = event.headers?.['X-Twilio-Signature'] || event.headers?.['x-twilio-signature'];
    if (twilioToken && twilioSignature) {
      // Reconstruct request URL for validation
      const host = event.headers?.['Host'] || event.headers?.['host'] || '';
      const proto = event.headers?.['X-Forwarded-Proto'] || 'https';
      const requestUrl = `${proto}://${host}${event.path || '/'}`;

      // Parse form-encoded body params for signature validation
      const params: Record<string, string> = {};
      if (event.headers?.['content-type']?.includes('application/x-www-form-urlencoded') && rawBody) {
        const entries = new URLSearchParams(rawBody);
        entries.forEach((value, key) => { params[key] = value; });
      }

      if (!validateTwilioSignature(twilioToken, requestUrl, params, twilioSignature)) {
        console.warn('Invalid Twilio signature, rejecting request');
        return { statusCode: 403, body: 'Invalid signature' };
      }
    }

    const body = typeof rawBody === 'string' && rawBody.startsWith('{')
      ? JSON.parse(rawBody)
      : Object.fromEntries(new URLSearchParams(rawBody));

    console.log('Webhook Body received, processing...');

    // Handle Twilio messaging webhook formats
    if (body.SmsSid || body.MessageSid) {
      const from = typeof body.From === 'string' ? body.From : '';
      const text = typeof body.Body === 'string' ? body.Body.slice(0, 1000) : ''; // Cap message length
      if (!from) {
        console.warn('Webhook message missing From field');
        return { statusCode: 200, body: 'OK' };
      }
      console.log(`Received message from ***${from.slice(-4)}`);

      // Send auto-reply
      await sendAutoReply(from, text);
    }

    return {
      statusCode: 200,
      body: 'OK',
    };
  } catch (error) {
    console.error('Error handling webhook:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};

async function sendAutoReply(to: string, incomingText: string) {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioSender = process.env.TWILIO_CHATWORKS_WHATSAPP_NUMBER;

  if (!twilioSid || !twilioToken || !twilioSender) {
    console.warn('Twilio credentials not configured. Auto-reply skipped.');
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
  const params = new URLSearchParams();
  params.set('To', to);
  params.set('From', `whatsapp:${twilioSender}`);

  const lowerText = incomingText.trim().toLowerCase();
  let body = '';

  if (lowerText === 'report') {
    body = 'Hello! Let\'s complete your Daily Site Report. What machine are you operating today?\n1. CAT 1\n2. CAT 2\n3. SANY 1\n4. SANY 2\nReply with the option number.';
  } else if (lowerText === '1' || lowerText === '2' || lowerText === '3' || lowerText === '4') {
    body = 'Thank you! Now enter your opening hour meter reading (e.g. 1420.5):';
  } else if (parseFloat(lowerText) > 0) {
    body = 'Awesome! Now enter your closing hour meter reading (must be greater than opening):';
  } else {
    body = 'Welcome to Alluvial Site Manager daily reporting service. Send "report" to start reporting your shift data, or "help" for support.';
  }

  params.set('Body', body);

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    console.log(`Auto-reply sent to ***${(to || '').slice(-4)}`);
  } catch (err) {
    console.error(`Failed to send auto-reply to ***${(to || '').slice(-4)}:`, err);
  }
}
