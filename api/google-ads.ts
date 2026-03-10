import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleAdsApi } from 'google-ads-api';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "124031170712-boi94op7mnikesrmq5ejpvn6p2qbul41.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "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";
const GOOGLE_DEVELOPER_TOKEN = process.env.GOOGLE_DEVELOPER_TOKEN || "gyeVHxxJU9_zDaUxLy3Ltg";
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || "1//04iQN_dGnCYG1CgYIARAAGAQSNwF-L9IrS4IdGxnUeEv7nHWK9tumuDTODnQwUvCg4uiU3FnP_U3Fx7MahFcAPBWUYCccFEmtSJI";
const GOOGLE_LOGIN_CUSTOMER_ID = process.env.GOOGLE_LOGIN_CUSTOMER_ID || "158-039-8490";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const loginCustomerId = GOOGLE_LOGIN_CUSTOMER_ID.replace(/-/g, "");
    
    const client = new GoogleAdsApi({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      developer_token: GOOGLE_DEVELOPER_TOKEN,
    });

    const customer = client.Customer({
      customer_id: loginCustomerId,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      login_customer_id: loginCustomerId,
    });

    // 1. Overall KPIs
    const kpiQuery = `
      SELECT
        metrics.cost_micros,
        metrics.conversions,
        metrics.clicks,
        metrics.impressions
      FROM customer
      WHERE segments.date DURING LAST_30_DAYS
    `;
    const kpiResults = await customer.query(kpiQuery);

    // 2. Daily Chart Data
    const dailyQuery = `
      SELECT
        segments.date,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM customer
      WHERE segments.date DURING LAST_30_DAYS
      ORDER BY segments.date ASC
    `;
    const dailyResults = await customer.query(dailyQuery);

    // 3. Campaigns Table
    const campaignsQuery = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign_budget.amount_micros,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM campaign
      WHERE campaign.status = 'ENABLED' AND segments.date DURING LAST_30_DAYS
    `;
    const campaignsResults = await customer.query(campaignsQuery);

    res.json({
      success: true,
      data: {
        kpis: kpiResults,
        daily: dailyResults,
        campaigns: campaignsResults
      }
    });
  } catch (error: any) {
    console.error(error);
    
    let errorMessage = error.message || "Internal Server Error";
    if (error.errors && error.errors.length > 0) {
      errorMessage = error.errors[0].message;
    }
    
    res.status(500).json({ error: errorMessage });
  }
}
