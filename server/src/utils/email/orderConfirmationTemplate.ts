export interface OrderEmailItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  status: string;
  createdAt: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  address: string;
  clientUrl: string;
  items: OrderEmailItem[];
}

// Escape user-provided text so the HTML email can't be broken or injected.
const esc = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const money = (n: number): string => `$${n.toFixed(2)}`;

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
};

// Full, email-client-safe (table + inline CSS) order confirmation.
export function orderConfirmationTemplate(data: OrderEmailData): string {
  const itemRows = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;vertical-align:middle;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
              <tr>
                <td style="width:52px;">
                  ${
                    item.image
                      ? `<img src="${esc(item.image)}" width="44" height="44" alt="" style="display:block;width:44px;height:44px;border-radius:8px;object-fit:cover;border:1px solid #e2e8f0;" />`
                      : `<span style="display:block;width:44px;height:44px;border-radius:8px;background:#e2e8f0;"></span>`
                  }
                </td>
                <td style="padding-left:12px;">
                  <div style="font-size:14px;font-weight:700;color:#0f172a;">${esc(item.name)}</div>
                  <div style="font-size:12px;color:#64748b;">Qty: ${item.quantity}</div>
                </td>
                <td style="text-align:right;font-size:14px;font-weight:700;color:#0f172a;white-space:nowrap;">
                  ${money(item.price * item.quantity)}
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    )
    .join("");

  const discountRow =
    data.discount > 0
      ? `<tr>
        <td style="padding:4px 0;color:#16a34a;">Coupon Savings</td>
        <td style="padding:4px 0;text-align:right;font-weight:600;color:#16a34a;">-${money(data.discount)}</td>
      </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order ${esc(data.orderNumber)} confirmed</title>
  </head>
  <body style="margin:0;padding:0;background:#f1f5f9;">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
      Thank you for your order! Total: ${money(data.total)} &mdash; ${esc(data.orderNumber)}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="background:#0f172a;padding:24px 32px;">
                <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:2px;">LUMEN</span>
                <span style="color:#94a3b8;font-size:12px;margin-left:8px;">Marketplace</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 32px 8px;text-align:center;">
                <div style="width:56px;height:56px;margin:0 auto 12px;border-radius:50%;background:#dcfce7;color:#16a34a;font-size:30px;line-height:56px;">&#10003;</div>
                <h1 style="margin:0 0 4px;font-size:22px;line-height:1.3;color:#0f172a;">Your order is confirmed</h1>
                <p style="margin:0;color:#64748b;font-size:14px;">Order <strong style="color:#2563eb;">#${esc(data.orderNumber)}</strong></p>
                <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">${esc(formatDate(data.createdAt))} &bull; Status: ${esc(data.status)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px;">
                <h2 style="margin:0 0 4px;font-size:13px;letter-spacing:0.5px;color:#94a3b8;text-transform:uppercase;">Order Summary</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows}</table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#475569;">
                  <tr>
                    <td style="padding:4px 0;">Subtotal</td>
                    <td style="padding:4px 0;text-align:right;font-weight:600;color:#0f172a;">${money(data.subtotal)}</td>
                  </tr>
                  ${discountRow}
                  <tr>
                    <td style="padding:4px 0;">Shipping</td>
                    <td style="padding:4px 0;text-align:right;font-weight:600;color:#0f172a;">${data.shipping === 0 ? "FREE" : money(data.shipping)}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;">Estimated Tax</td>
                    <td style="padding:4px 0;text-align:right;font-weight:600;color:#0f172a;">${money(data.tax)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0 0;border-top:1px solid #e2e8f0;font-size:14px;font-weight:800;color:#0f172a;">Total</td>
                    <td style="padding:10px 0 0;border-top:1px solid #e2e8f0;text-align:right;font-size:18px;font-weight:800;color:#2563eb;">${money(data.total)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
                  <tr>
                    <td style="padding:16px;font-size:13px;color:#475569;">
                      <div style="font-weight:800;color:#0f172a;margin-bottom:6px;">Delivery Details</div>
                      <div><span style="color:#94a3b8;">Address:</span> ${esc(data.address)}</div>
                      <div style="margin-top:4px;"><span style="color:#94a3b8;">Payment:</span> ${esc(data.paymentMethod)}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px;text-align:center;">
                <a href="${esc(data.clientUrl)}/orders" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">Track Your Order</a>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="margin:0;color:#94a3b8;font-size:12px;">Lumen Marketplace &bull; support@lumen.com</p>
                <p style="margin:6px 0 0;color:#cbd5e1;font-size:11px;">&copy; 2026 Lumen Tech Marketplace. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
