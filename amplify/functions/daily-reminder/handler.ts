import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(dbClient);

async function scanAll(params: any) {
  const items: any[] = [];
  let lastKey: any = undefined;
  do {
    const cmd = new ScanCommand({ ...params, Limit: 500, ExclusiveStartKey: lastKey });
    const result = await docClient.send(cmd);
    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

export const handler = async (event: any) => {
  console.log('Running daily reminder checks...');

  try {
    const userTableName = process.env.USER_TABLE_NAME;
    const reportTableName = process.env.REPORT_TABLE_NAME;

    if (!userTableName || !reportTableName) {
      console.warn('Table names not configured via environment variables.');
      return { success: false, error: 'Table environment variables not configured' };
    }

    // Get all active users with pagination
    const users = await scanAll({
      TableName: userTableName,
      FilterExpression: '#status = :active',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':active': 'ACTIVE' },
    });

    console.log(`Found ${users.length} active users`);

    // Check today's reports with pagination
    const today = new Date().toISOString().split('T')[0];
    const reports = await scanAll({
      TableName: reportTableName,
      FilterExpression: 'reportDate = :today',
      ExpressionAttributeValues: { ':today': today },
    });

    const submittedUserIds = new Set(
      reports.map((r: any) => r.userId)
    );

    // Find users who haven't submitted today
    const pendingUsers = users.filter(
      (u: any) => !submittedUserIds.has(u.id) && u.role !== 'SYSTEM_ADMIN' && u.role !== 'GENERAL_WORKER'
    );

    console.log(`${pendingUsers.length} users have not submitted reports today`);

    // Send reminders with rate limiting (max 5 concurrent)
    const BATCH_SIZE = 5;
    for (let i = 0; i < pendingUsers.length; i += BATCH_SIZE) {
      const batch = pendingUsers.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((user: any) => {
        console.log(`Reminder needed: ${user.firstName} ${user.lastName} (${user.role})`);
        return triggerWhatsAppReminder(user);
      }));
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
    console.log(`Reminder sent to ${user.firstName}: ${response.status}`);
  } catch (err) {
    console.error(`Failed to send reminder to ${user.firstName}:`, err);
  }
}
