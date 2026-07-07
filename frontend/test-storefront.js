import dotenv from 'dotenv';
dotenv.config();

async function testStorefrontToken() {
  const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const storefrontToken = process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
  
  // Wait, I need a valid customerAccessToken. I don't have one!
  console.log("No customer token, can't test.");
}
testStorefrontToken();
