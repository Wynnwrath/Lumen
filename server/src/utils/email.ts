import { config } from "../config/env.js";
import { orderConfirmationTemplate } from "./email/orderConfirmationTemplate.js";
import type { OrderEmailData } from "./email/orderConfirmationTemplate.js";

// Sends the order confirmation email. If there's no RESEND_API_KEY
// (like in local dev), log it to the console instead.
export async function sendOrderConfirmation(to: string, order: OrderEmailData): Promise<void> {
  const apiKey = config.resendApiKey;
  const subject = `Your Lumen order ${order.orderNumber} is confirmed`;
  const html = orderConfirmationTemplate(order);

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
