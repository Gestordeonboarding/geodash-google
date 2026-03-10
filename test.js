import fetch from 'node-fetch';

async function test() {
  const res = await fetch('https://googleads.googleapis.com/v17/customers/1580398490/googleAds:searchStream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: 'SELECT campaign.id FROM campaign' })
  });
  console.log(res.status);
  console.log(await res.text());
}

test();
