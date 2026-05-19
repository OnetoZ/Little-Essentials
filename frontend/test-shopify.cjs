// using native fetch

const domain = 'littleessentials-6498.myshopify.com';
const token = 'c0774e44ae6633f5f2ceca92a659371e';
const endpoint = `https://${domain}/api/2024-10/graphql.json`;

const email = `test${Date.now()}@example.com`;
const password = 'Password123!';

async function run() {
  console.log('Registering with', email);
  const registerRes = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({
      query: `mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer { id email }
          customerUserErrors { code field message }
        }
      }`,
      variables: { input: { firstName: 'Test', lastName: 'User', email, password } }
    })
  });
  const registerData = await registerRes.json();
  console.log('Register Response:', JSON.stringify(registerData, null, 2));

  console.log('\nLogging in...');
  const loginRes = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({
      query: `mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken { accessToken expiresAt }
          customerUserErrors { code field message }
        }
      }`,
      variables: { input: { email, password } }
    })
  });
  const loginData = await loginRes.json();
  console.log('Login Response:', JSON.stringify(loginData, null, 2));
}

run();
