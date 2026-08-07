import { config } from "../config/env.js";

interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  total: number;
  items: OrderEmailItem[];
}

// Sends the order confirmation email. If there's no RESEND_API_KEY
// (like in local dev), log it to the console instead.
export async function sendOrderConfirmation(to: string, order: OrderEmailData): Promise<void> {
  const apiKey = config.resendApiKey;
  const subject = `Your Lumen order ${order.orderNumber} is confirmed`;
  const itemsHtml = order.items
    .map((i) => `<li>${i.name} x${i.quantity} &mdash; $${(i.price * i.quantity).toFixed(2)}</li>`)
    .join("");
  const html =
    `<h2>Thank you for your order, ${order.customerName}!</h2>` +
    `<p>Your order <strong>${order.orderNumber}</strong> is confirmed.</p>` +
    `<p><strong>Total: $${order.total.toFixed(2)}</strong></p>` +
    `<ul>${itemsHtml}</ul>` +
    `<p>We'll keep you updated as your order progresses.</p>`;

  if (apiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Lumen Store <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error("Resend email failed:", await res.text());
    }
  } else {
    console.log(
      `[EMAIL] To: ${to} | Subject: ${subject} | Order: ${order.orderNumber} | Total: $${order.total.toFixed(2)}`
    );
  }
}
