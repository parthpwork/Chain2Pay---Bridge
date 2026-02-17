"use client";

import { useEffect, useState } from "react";

export default function PayPage() {
  const [status, setStatus] = useState("loading");
  const [err, setErr] = useState("");

  async function start() {
    setErr("");
    setStatus("creating-payment");

    const params = new URLSearchParams(window.location.search);
    const order_id = params.get("order_id");
    const shop = params.get("shop") || process.env.NEXT_PUBLIC_SHOPIFY_SHOP;

    if (!order_id || !shop) {
      setStatus("error");
      setErr("Missing order_id or shop.");
      return;
    }

    const res = await fetch("/api/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id, shop })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus("error");
      setErr(data?.error || "Failed to create payment.");
      return;
    }

    if (!data?.payment_url) {
      setStatus("error");
      setErr("No payment_url returned from server.");
      return;
    }

    setStatus("redirecting");
    window.location.href = data.payment_url;
  }

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ maxWidth: 740, margin: "40px auto", padding: 16 }}>
      <h1>Complete your payment</h1>
      <p>This page will send you securely to Chain2Pay.</p>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <div><b>Status:</b> {status}</div>
        {err ? <div style={{ marginTop: 8, color: "crimson" }}><b>Error:</b> {err}</div> : null}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={start} style={{ padding: "10px 14px" }}>
          Continue to Payment
        </button>
      </div>
    </main>
  );
}