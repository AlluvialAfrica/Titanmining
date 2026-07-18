import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(dbClient);

export const handler = async (event: any) => {
  console.log('Running daily reminder checks...', JSON.stringify(event));

  try {
    // Scan User table for active users who should submit daily reports
    const userTableName = process.env.USER_TABLE_NAME;
    const reportTableName = process.env.REPORT_TABLE_NAME;

    if (!userTableName || !reportTableName) {
      console.warn('Table names not configured via environment variables. Scanning for table names...');
      return { success: false, error: 'Table environment variables not configured' };
    }

    // Get all active users
    const usersResult = await docClient.send(new ScanCommand({
      TableName: userTableName,
      FilterExpression: '#status = :active',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':active': 'ACTIVE' },
    }));

    const users = usersResult.Items || [];
    console.log(`Found ${users.length} active users`);

    // Check today's reports
    const today = new Date().toISOString().split('T')[0];
    const reportsResult = await docClient.send(new ScanCommand({
      TableName: reportTableName,
      FilterExpression: 'reportDate = :today',
      ExpressionAttributeValues: { ':today': today },
    }));

    const submittedUserIds = new Set(
      (reportsResult.Items || []).map((r: any) => r.userId)
    );

    // Find users who haven't submitted today
    const pendingUsers = users.filter(
      (u: any) => !submittedUserIds.has(u.id) && u.role !== 'SYSTEM_ADMIN' && u.role !== 'GENERAL_WORKER'
    );

    console.log(`${pendingUsers.length} users have not submitted reports today`);

    for (const user of pendingUsers) {
      console.log(`Reminder needed: ${user.firstName} ${user.lastName} (${user.role}) at ${user.mobileNumber}`);
      await triggerWhatsAppReminder(user);
    }

    return { success: true, pendingCount: pendingUsers.length, totalUsers: users.length };
  } catch (error) {
    console.error('Error running daily reminder:', error);
    return { success: false, error: String(error) };
  }
};

async function triggerWhatsAppReminder(user: any) {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioSender = process.env.TWILIO_CHATWORKS_WHATSAPP_NUMBER;
  const reminderTemplateSid = process.env.TWILIO_REMINDER_CONTENT_SID;

  if (!twilioSid || !twilioToken || !twilioSender) {
    console.warn('Twilio credentials not configured. Skipping WhatsApp reminder.');
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
  const params = new URLSearchParams();
  params.set('To', `whatsapp:${user.mobileNumber}`);
  params.set('From', `whatsapp:${twilioSender}`);

  if (reminderTemplateSid) {
    params.set('ContentSid', reminderTemplateSid);
    params.set('ContentVariables', JSON.stringify({
      '1': user.firstName,
      '2': 'Alluvial Mining',
      '3': user.role,
      '4': new Date().toISOString().split('T')[0],
      '5': user.shift || 'N/A',
    }));
  } else {
    params.set('Body', `Hi ${user.firstName}, this is a reminder to submit your daily report for ${new Date().toISOString().split('T')[0]}. Please log in to the Alluvial Site Manager.`);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    console.log(`Reminder sent to ${user.firstName}:`, response.status);
  } catch (err) {
    console.error(`Failed to send reminder to ${user.firstName}:`, err);
  }
}
