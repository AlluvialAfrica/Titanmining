import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

export const handler = async (event: { phone: string; code: string; email?: string }) => {
  const { phone, code } = event;
  console.log(`Sending OTP to phone ***${phone.slice(-4)}...`);

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioSender = process.env.TWILIO_CHATWORKS_WHATSAPP_NUMBER;
  const contentSid = process.env.TWILIO_CHATWORKS_WHATSAPP_AUTH_CONTENT_SID;

  if (!twilioSid || !twilioToken || !twilioSender) {
    console.warn('Twilio credentials not fully configured. Falling back to SMS via AWS SNS.');
    return await sendSnsFallback(phone, code);
  }

  // Normalize phone number (must start with +)
  const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

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
    return { success: true, method: 'whatsapp' };
  } catch (error) {
    console.error('Failed to send OTP via WhatsApp. Falling back to SMS via AWS SNS.', error);
    return await sendSnsFallback(normalizedPhone, code);
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
