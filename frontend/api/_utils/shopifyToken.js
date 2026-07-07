/**
 * Shopify Admin API Token Utility
 *
 * Shopify Spring '26 OAuth model (Partner Dashboard Apps):
 * - Complete the authorization_code OAuth flow ONCE to get a permanent offline access token.
 * - Store that token as SHOPIFY_ADMIN_TOKEN in your .env / Vercel environment variables.
 * - The token does NOT expire unless you uninstall the app or revoke it.
 *
 * HOW TO GET YOUR TOKEN (do this once):
 *
 * Step 1) Add http://localhost:5174/callback to Allowed Redirect URLs in your Shopify Partner
 *          Dashboard → App Setup → Allowed redirection URL(s). Click Save.
 *
 * Step 2) Open this URL in your browser (you must be logged into your Shopify admin):
 *   https://littleessentials-6498.myshopify.com/admin/oauth/authorize?client_id=aaadc22b55d82af469574ca6ac407537&scope=read_products,write_products,read_orders,write_orders,read_inventory,write_inventory,read_customers,write_customers&redirect_uri=http://localhost:5174/callback&state=1234&grant_options[]=
 *
 * Step 3) Click "Install". Your browser will redirect to localhost/callback?code=XXX.
 *          The page shows 404, that's fine. Copy the `code` value from the URL.
 *
 * Step 4) In a terminal, run (replace YOUR_CODE and YOUR_SECRET):
 *
 *   curl -X POST https://littleessentials-6498.myshopify.com/admin/oauth/access_token \
 *     -H "Content-Type: application/json" \
 *     -d '{"client_id":"aaadc22b55d82af469574ca6ac407537","client_secret":"YOUR_SECRET","code":"YOUR_CODE"}'
 *
 * Step 5) Copy the returned `access_token` value into your .env file as:
 *   SHOPIFY_ADMIN_TOKEN=shpca_xxxxxxxxxxxxxxxxxxxxxxxx
 *
 * That token is permanent and can be reused indefinitely.
 */

export function getShopifyAccessToken() {
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!token) {
    throw new Error(
      '[Shopify] SHOPIFY_ADMIN_TOKEN is not set. ' +
      'See instructions in api/_utils/shopifyToken.js to complete the one-time OAuth flow.'
    );
  }
  return token;
}
