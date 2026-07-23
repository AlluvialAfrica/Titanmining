import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;
const OTP_REGEX = /^\d{4,8}$/;

function respond(statusCode: number, body: Record<string, unknown>) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
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

  // Determine input: Function URL (event.body) vs direct Lambda invocation (event.phone)
  let phone: string;
  let code: string;

  if (event.body) {
    // Function URL / API Gateway invocation
    let parsed: any;
    try {
      parsed = JSON.parse(event.body);
    } catch {
      return respond(400, { success: false, error: 'Invalid JSON body' });
    }
    phone = parsed.phone;
    code = parsed.code;
  } else {
    // Direct Lambda invocation (e.g. Cognito MFA)
    phone = event.phone;
    code = event.code;
  }

  // Validate required inputs
  if (!phone || typeof phone !== 'string') {
    console.error('OTP send failed: missing or invalid phone');
    const err = { success: false, error: 'Phone number is required' };
    return event.body ? respond(400, err) : err;
  }
  if (!code || typeof code !== 'string' || !OTP_REGEX.test(code)) {
    console.error('OTP send failed: missing or invalid code format');
    const err = { success: false, error: 'OTP code must be 4-8 digits' };
    return event.body ? respond(400, err) : err;
  }

  // Normalize phone number (must start with +)
  const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

  if (!PHONE_REGEX.test(normalizedPhone)) {
    console.error(`OTP send failed: invalid phone format ***${normalizedPhone.slice(-4)}`);
    const err = { success: false, error: 'Invalid phone number format. Must be international format (e.g. +254...)' };
    return event.body ? respond(400, err) : err;
  }

  console.log(`Sending OTP to phone ***${normalizedPhone.slice(-4)}...`);

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioSender = process.env.TWILIO_CHATWORKS_WHATSAPP_NUMBER;
  const contentSid = process.env.TWILIO_CHATWORKS_WHATSAPP_AUTH_CONTENT_SID;

  if (!twilioSid || !twilioToken || !twilioSender) {
    console.warn('Twilio credentials not fully configured. Falling back to SMS via AWS SNS.');
    const result = await sendSnsFallback(normalizedPhone, code);
    return event.body ? respond(result.success ? 200 : 500, result) : result;
  }

  try {
    const authHeader = `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;

    const params = new URLSearchParams();
    params.set('To', `whatsapp:${normalizedPhone}`);
    params.set('From', `whatsapp:${twilioSender}`);

    if (contentSid) {
      params.set('ContentSid', contentSid);
      params.set('ContentVariables', JSON.stringify({ '1': code }));
    } else {
      params.set('Body', `Your Alluvial Site Manager security code is ${code}. It expires in 10 minutes.`);
    }

    console.log('Sending Twilio WhatsApp request...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`Twilio API returned status ${response.status}: ${responseText}`);
    }

    console.log('WhatsApp OTP sent successfully via Twilio.');
    const result = { success: true, method: 'whatsapp' };
    return event.body ? respond(200, result) : result;
  } catch (error) {
    console.error('Failed to send OTP via WhatsApp. Falling back to SMS via AWS SNS.', error);
    const result = await sendSnsFallback(normalizedPhone, code);
    return event.body ? respond(result.success ? 200 : 500, result) : result;
  }
};

async function sendSnsFallback(phone: string, code: string) {
  console.log(`Sending SMS fallback via SNS to ***${phone.slice(-4)}...`);
  const sns = new SNSClient({ region: process.env.AWS_REGION || 'eu-north-1' });

  try {
    await sns.send(new PublishCommand({
      PhoneNumber: phone,
      Message: `Your Alluvial Site Manager security code is ${code}. It expires in 10 minutes.`,
    }));
    console.log('SMS sent successfully via SNS.');
    return { success: true, method: 'sms' };
  } catch (error) {
    console.error('Failed to send SMS via SNS:', error);
    return { success: false, error: String(error) };
  }
}
