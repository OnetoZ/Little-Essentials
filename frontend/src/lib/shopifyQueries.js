/**
 * Shopify Storefront API — GraphQL Queries
 *
 * All queries/mutations that talk to Shopify live here.
 * Ported from backend/src/routes/*.js
 */

// ─── Product Fields (Storefront API) ────────────────────────────────
export const SF_PRODUCT_FIELDS = `
  id
  handle
  title
  vendor
  productType
  tags
  availableForSale
  createdAt
  description
  descriptionHtml
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  compareAtPriceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  images(first: 6) {
    edges { node { url altText width height } }
  }
  variants(first: 30) {
    edges {
      node {
        id
        title
        availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
        image { url altText }
      }
    }
  }
  options { name values }
  metafields(identifiers: [
    { namespace: "custom", key: "rating" },
    { namespace: "custom", key: "review_count" }
  ]) {
    key
    value
  }
`

// ─── Product Queries ─────────────────────────────────────────────────

export const ALL_PRODUCTS_QUERY = `
  query AllProducts($first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
      pageInfo { hasNextPage endCursor }
      edges { node { ${SF_PRODUCT_FIELDS} } }
    }
  }
`

export const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: PRODUCT) {
      edges {
        node {
          ... on Product { ${SF_PRODUCT_FIELDS} }
        }
      }
    }
  }
`

export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) { ${SF_PRODUCT_FIELDS} }
  }
`

// ─── Collection Queries ──────────────────────────────────────────────

export const ALL_COLLECTIONS_QUERY = `
  query Collections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image { url altText width height }
          products(first: 3) {
            edges {
              node { ${SF_PRODUCT_FIELDS} }
            }
          }
        }
      }
    }
  }
`

export const COLLECTION_BY_HANDLE_QUERY = `
  query CollectionByHandle($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image { url altText width height }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
        pageInfo { hasNextPage endCursor }
        edges {
          node { ${SF_PRODUCT_FIELDS} }
        }
      }
    }
  }
`

// ─── Customer Auth Mutations ─────────────────────────────────────────

export const CUSTOMER_LOGIN_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`

export const CUSTOMER_RECOVER_MUTATION = `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`

export const CUSTOMER_REGISTER_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`

export const CUSTOMER_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      defaultAddress {
        address1
        address2
        city
        province
        zip
        country
      }
    }
  }
`

export const CUSTOMER_PROFILE_QUERY = `
  query getCustomerProfile($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      addresses(first: 10) {
        edges {
          node {
            id
            address1
            address2
            city
            province
            zip
            country
            company
          }
        }
      }
      defaultAddress {
        id
        address1
        address2
        city
        province
        zip
        country
      }
    }
  }
`

export const CUSTOMER_ADDRESS_CREATE_MUTATION = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress { id }
      customerUserErrors { message }
    }
  }
`

export const CUSTOMER_ADDRESS_UPDATE_MUTATION = `
  mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress { id }
      customerUserErrors { message }
    }
  }
`

export const CUSTOMER_ADDRESS_DELETE_MUTATION = `
  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      deletedCustomerAddressId
      customerUserErrors { message }
    }
  }
`

export const CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION = `
  mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
      customer { id }
      customerUserErrors { message }
    }
  }
`

// ─── Checkout (Storefront API) ───────────────────────────────────────

export const CHECKOUT_CREATE_MUTATION = `
  mutation checkoutCreate($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        webUrl
        totalPriceV2 { amount currencyCode }
        lineItems(first: 50) {
          edges {
            node {
              title
              quantity
              variant {
                priceV2 { amount currencyCode }
              }
            }
          }
        }
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`

export const CUSTOMER_ORDERS_QUERY = `
  query getCustomerOrders($customerAccessToken: String!, $first: Int!) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            fulfillmentStatus
            financialStatus
            statusUrl
            subtotalPriceV2 { amount currencyCode }
            totalShippingPriceV2 { amount currencyCode }
            totalTaxV2 { amount currencyCode }
            totalPriceV2 { amount currencyCode }
            shippingAddress {
              firstName
              lastName
              address1
              address2
              city
              province
              country
              zip
            }
            lineItems(first: 20) {
              edges {
                node {
                  title
                  quantity
                  originalTotalPrice { amount currencyCode }
                  variant {
                    image { url }
                    priceV2 { amount currencyCode }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
