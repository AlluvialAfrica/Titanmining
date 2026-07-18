import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(dbClient);

async function scanAll(params: Record<string, any>) {
  const items: any[] = [];
  let lastKey: any = undefined;
  do {
    const result: any = await docClient.send(new ScanCommand({
      ...params,
      Limit: 500,
      ExclusiveStartKey: lastKey,
    }));
    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

export const handler = async (event: { orgId?: string; siteId?: string; date?: string }) => {
  const date = event.date || new Date().toISOString().split('T')[0];
  const orgId = event.orgId || 'all';
  const siteId = event.siteId || 'all';

  console.log(`Running report aggregator for date=${date}, org=${orgId}, site=${siteId}`);

  try {
    const reportTableName = process.env.REPORT_TABLE_NAME;
    const fuelTableName = process.env.FUEL_TABLE_NAME;
    const goldTableName = process.env.GOLD_TABLE_NAME;

    if (!reportTableName) {
      console.warn('REPORT_TABLE_NAME not configured');
      return { success: false, error: 'Table environment variables not configured' };
    }

    // Scan daily reports for the given date with pagination
    const reports = await scanAll({
      TableName: reportTableName,
      FilterExpression: 'reportDate = :date',
      ExpressionAttributeValues: { ':date': date },
    });

    console.log(`Found ${reports.length} reports for ${date}`);

    // Group reports by type
    const reportsByType: Record<string, any[]> = {};
    for (const report of reports) {
      const type = report.reportType || 'UNKNOWN';
      if (!reportsByType[type]) reportsByType[type] = [];
      reportsByType[type].push(report);
    }

    // Aggregate fuel data if table is configured
    let fuelSummary = { openingStock: 0, received: 0, issued: 0, closingStock: 0, variance: 0 };
    if (fuelTableName) {
      const fuelRecords = await scanAll({
        TableName: fuelTableName,
        FilterExpression: 'reportDate = :date',
        ExpressionAttributeValues: { ':date': date },
      });
      for (const f of fuelRecords) {
        fuelSummary.openingStock += f.openingStock || 0;
        fuelSummary.received += f.received || 0;
        fuelSummary.issued += f.totalIssued || 0;
        fuelSummary.closingStock += f.closingStock || 0;
        fuelSummary.variance += f.variance || 0;
      }
    }

    // Aggregate gold recovery data if table is configured
    let goldSummary = { totalRecoveryG: 0, entryCount: 0 };
    if (goldTableName) {
      const goldRecords = await scanAll({
        TableName: goldTableName,
        FilterExpression: 'reportDate = :date',
        ExpressionAttributeValues: { ':date': date },
      });
      for (const g of goldRecords) {
        goldSummary.totalRecoveryG += g.goldWeight || 0;
        goldSummary.entryCount++;
      }
    }

    const summary = {
      date,
      orgId,
      siteId,
      totalReports: reports.length,
      reportsByType: Object.fromEntries(
        Object.entries(reportsByType).map(([type, items]) => [type, items.length])
      ),
      fuel: fuelSummary,
      gold: goldSummary,
    };

    console.log('Aggregation complete:', JSON.stringify(summary));
    return { success: true, summary };
  } catch (error) {
    console.error('Error during report aggregation:', error);
    return { success: false, error: String(error) };
  }
};
