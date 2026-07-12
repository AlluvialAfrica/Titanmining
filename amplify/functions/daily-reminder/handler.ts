import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(dbClient);

export const handler = async (event: any) => {
  console.log('Running daily reminder checks...', event);
  
  try {
    // In a production environment, scan all organizations
    // For this prototype, we print logs and simulate reminder sending
    console.log('Scanning organizations and checking daily reports...');
    
    // Simulate finding users with missing reports
    const pendingUsers = [
      { firstName: 'John', mobileNumber: '+254712345678', role: 'EXCAVATOR_OPERATOR', shift: 'SHIFT_1' }
    ];

    for (const user of pendingUsers) {
      console.log(`Sending reminder to ${user.firstName} at ${user.mobileNumber}...`);
      await triggerWhatsAppReminder(user);
    }

    return { success: true };
  } catch (error) {
    console.error('Error running daily reminder:', error);
    return { success: false, error: String(error) };
  }
};

async function triggerWhatsAppReminder(user: any) {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioSender = process.env.TWILIO_CHATWORKS_WHATSAPP_NUMBER || '+12058469763';
  const reminderTemplateSid = 'HX9f8489c25dfc00c86cf5442232'; // placeholder

  if (!twilioSid || !twilioToken) {
    console.warn('Twilio credentials not configured. Cannot send WhatsApp reminder.');
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
  const params = new URLSearchParams();
  params.set('To', `whatsapp:${user.mobileNumber}`);
  params.set('From', `whatsapp:${twilioSender}`);
  params.set('ContentSid', reminderTemplateSid);
  params.set('ContentVariables', JSON.stringify({
    '1': user.firstName,
    '2': 'Alluvial Mining',
    '3': user.role,
    '4': new Date().toISOString().split('T')[0],
    '5': user.shift
  }));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    console.log(`Reminder sent to ${user.firstName}:`, await response.text());
  } catch (err) {
    console.error(`Failed to send reminder to ${user.firstName}:`, err);
  }
}
