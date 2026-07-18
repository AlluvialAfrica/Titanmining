import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Received WhatsApp Webhook event:', event.httpMethod, event.path);

  // Verify GET webhook challenge for webhook registration
  if (event.httpMethod === 'GET') {
    const queryParams = event.queryStringParameters || {};
    const mode = queryParams['hub.mode'];
    const token = queryParams['hub.verify_token'];
    const challenge = queryParams['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log('Webhook verified successfully.');
        return {
          statusCode: 200,
          body: challenge || 'OK',
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
    const body = JSON.parse(event.body || '{}');
    console.log('Webhook Body received, processing...');

    // Handle Twilio messaging webhook formats
    if (body.SmsSid || body.MessageSid) {
      const from = body.From; // e.g. whatsapp:+254712345678
      const text = body.Body; // message content
      console.log(`Received message from ***${(from || '').slice(-4)}`);
      
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
