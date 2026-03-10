import { GoogleAdsApi } from 'google-ads-api';

async function test() {
  const GOOGLE_CLIENT_ID = "124031170712-boi94op7mnikesrmq5ejpvn6p2qbul41.apps.googleusercontent.com";
  const GOOGLE_CLIENT_SECRET = "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";
  const GOOGLE_DEVELOPER_TOKEN = "gyeVHxxJU9_zDaUxLy3Ltg";
  const GOOGLE_REFRESH_TOKEN = "1//04iQN_dGnCYG1CgYIARAAGAQSNwF-L9IrS4IdGxnUeEv7nHWK9tumuDTODnQwUvCg4uiU3FnP_U3Fx7MahFcAPBWUYCccFEmtSJI";
  const GOOGLE_LOGIN_CUSTOMER_ID = "1580398490";

  const client = new GoogleAdsApi({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    developer_token: GOOGLE_DEVELOPER_TOKEN,
  });

  const customer = client.Customer({
    customer_id: GOOGLE_LOGIN_CUSTOMER_ID,
    refresh_token: GOOGLE_REFRESH_TOKEN,
    login_customer_id: GOOGLE_LOGIN_CUSTOMER_ID,
  });

  try {
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
    console.log(kpiResults);
  } catch (e) {
    console.error(e);
  }
}

test();
