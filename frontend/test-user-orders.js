import { getShopifyAccessToken } from './api/_utils/shopifyToken.js';
import dotenv from 'dotenv';
dotenv.config();

async function testUserOrders() {
  const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const adminToken = getShopifyAccessToken();
  const email = "sandanam.k.s76@kalvium.community";

  const adminRes = await fetch(`https://${shopifyDomain}/admin/api/2025-07/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
    },
    body: JSON.stringify({
      query: `
          query getOrders($query: String!) {
            orders(first: 20, query: $query, sortKey: CREATED_AT, reverse: true) {
              edges {
                node {
                  id
                  name
                  createdAt
                  displayFulfillmentStatus
                  displayFinancialStatus
                  totalPriceSet { shopMoney { amount currencyCode } }
                  lineItems(first: 50) {
                    edges {
                      node {
                        title
                        quantity
                        image { url }
                      }
                    }
                  }
                }
              }
            }
          }
      `,
      variables: { query: `email:${email}` }
    })
  });

  const adminData = await adminRes.json();
  console.log("Admin Data:", JSON.stringify(adminData, null, 2));
}

testUserOrders();
