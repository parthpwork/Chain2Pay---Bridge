import { getShopifyAccessToken } from "./shopifyToken";

export async function getOrder(shop, orderId) {
  const token = await getShopifyAccessToken(shop);

  const resp = await fetch(`https://${shop}/admin/api/2024-01/orders/${orderId}.json`, {
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json"
    }
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data?.order) {
    throw new Error(`Order fetch failed: ${JSON.stringify(data)}`);
  }

  return data.order;
}