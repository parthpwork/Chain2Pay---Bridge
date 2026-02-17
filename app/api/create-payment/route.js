import { getOrder } from "../../../lib/shopifyAdmin";
import { createChain2PayPayment } from "../../../lib/chain2pay";

export async function POST(request) {
  try {
    const { order_id, shop } = await request.json();

    if (!order_id) return Response.json({ error: "Missing order_id" }, { status: 400 });
    if (!shop) return Response.json({ error: "Missing shop" }, { status: 400 });

    const order = await getOrder(shop, order_id);

    const amountStr = order?.current_total_price || order?.total_price;
    const amount = parseFloat(amountStr || "0");

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return Response.json({ error: `Invalid order amount: ${amountStr}` }, { status: 400 });
    }

    const email = order?.email || order?.customer?.email || "";

    const c2p = await createChain2PayPayment({ amount, email });

    return Response.json({
      payment_url: c2p.payment_url,
      chain2pay_order_id: c2p.order_id ?? null,
      ipn_token: c2p.ipn_token ?? null
    });
  } catch (e) {
    return Response.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}