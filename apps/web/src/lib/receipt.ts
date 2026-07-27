export type ReceiptData = {
  invoiceNo: string;
  createdAt: string;
  orderType: string;
  paymentMethod: string | null;
  notes: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  total: number;
  cashier: { name: string } | null;
  items: { quantity: number; unitPrice: number; note: string | null; item: { name: string } }[];
  settings: {
    name: string;
    tagline: string;
    address: string;
    phone: string;
    whatsapp: string;
    currencySymbol: string;
    parentBrand: string;
  };
};

export function buildReceiptHtml(data: ReceiptData): string {
  const sym = data.settings.currencySymbol || "Rs.";
  const fmt = (n: number) => `${sym} ${Math.round(n).toLocaleString("en-PK")}`;
  const date = new Date(data.createdAt).toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemRows = data.items
    .map(
      (line) => `
      <tr>
        <td class="item-name">${line.item.name}${line.note ? `<br><small>${line.note}</small>` : ""}</td>
        <td class="item-qty">${line.quantity}</td>
        <td class="item-price">${fmt(line.unitPrice * line.quantity)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${data.invoiceNo} - Desert Bite</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #fff;
      color: #111;
      width: 80mm;
      max-width: 80mm;
      margin: 0 auto;
      padding: 8px;
      font-size: 12px;
    }
    .header {
      background: #1a1a1a;
      color: #fff;
      text-align: center;
      padding: 12px 8px;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    .brand-name {
      font-size: 22px;
      font-weight: 700;
      color: #fbbf24;
      font-style: italic;
      letter-spacing: 0.5px;
    }
    .brand-sub {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      margin-top: 2px;
    }
    .tagline {
      font-size: 10px;
      color: #d4d4d8;
      margin-top: 4px;
    }
    .parent-brand {
      font-size: 9px;
      color: #fbbf24;
      margin-top: 6px;
    }
    .contact {
      text-align: center;
      font-size: 10px;
      margin-bottom: 8px;
      line-height: 1.5;
    }
    .meta {
      border-top: 1px dashed #999;
      border-bottom: 1px dashed #999;
      padding: 6px 0;
      margin-bottom: 8px;
      font-size: 10px;
    }
    .meta-row { display: flex; justify-content: space-between; margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    th {
      text-align: left;
      font-size: 10px;
      border-bottom: 1px solid #333;
      padding: 4px 2px;
    }
    td { padding: 4px 2px; vertical-align: top; font-size: 11px; }
    .item-qty { text-align: center; width: 28px; }
    .item-price { text-align: right; white-space: nowrap; }
    .totals { font-size: 11px; }
    .totals .row {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
    }
    .totals .grand {
      border-top: 2px solid #1a1a1a;
      margin-top: 4px;
      padding-top: 6px;
      font-size: 16px;
      font-weight: 800;
      color: #dc2626;
    }
    .footer {
      text-align: center;
      margin-top: 10px;
      font-size: 10px;
      border-top: 1px dashed #999;
      padding-top: 8px;
    }
    .footer strong { color: #fbbf24; }
    @media print {
      body { width: 80mm; padding: 0; }
      @page { size: 80mm auto; margin: 2mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-name">Desert Bite</div>
    <div class="brand-sub">PIZZA KITCHEN</div>
    <div class="tagline">${data.settings.tagline}</div>
    <div class="parent-brand">A Product of ${data.settings.parentBrand}</div>
  </div>

  <div class="contact">
    ${data.settings.address}<br>
    Tel/WhatsApp: ${data.settings.phone}
  </div>

  <div class="meta">
    <div class="meta-row"><span>Invoice:</span><strong>${data.invoiceNo}</strong></div>
    <div class="meta-row"><span>Date:</span><span>${date}</span></div>
    <div class="meta-row"><span>Type:</span><span>${data.orderType.replace(/_/g, " ")}</span></div>
    <div class="meta-row"><span>Cashier:</span><span>${data.cashier?.name ?? "-"}</span></div>
    ${data.paymentMethod ? `<div class="meta-row"><span>Payment:</span><span>${data.paymentMethod.replace(/_/g, " ")}</span></div>` : ""}
  </div>

  <table>
    <thead>
      <tr><th>Item</th><th>Qty</th><th>Amount</th></tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Subtotal</span><span>${fmt(data.subtotal)}</span></div>
    ${data.discount > 0 ? `<div class="row"><span>Discount</span><span>-${fmt(data.discount)}</span></div>` : ""}
    ${data.tax > 0 ? `<div class="row"><span>Tax</span><span>${fmt(data.tax)}</span></div>` : ""}
    ${data.serviceCharge > 0 ? `<div class="row"><span>Service</span><span>${fmt(data.serviceCharge)}</span></div>` : ""}
    <div class="row grand"><span>TOTAL</span><span>${fmt(data.total)}</span></div>
  </div>

  ${data.notes ? `<p style="margin-top:8px;font-size:10px;"><em>Note: ${data.notes}</em></p>` : ""}

  <div class="footer">
    <strong>Thank You!</strong><br>
    Home Delivery Available<br>
    ${data.settings.parentBrand}
  </div>

  <script>
    window.onload = function() {
      if (new URLSearchParams(location.search).get('autoprint') === '1') {
        window.print();
      }
    };
  </script>
</body>
</html>`;
}

export function printReceiptWindow(
  data: ReceiptData,
  autoPrint = true,
  options?: { printerName?: string; silent?: boolean }
) {
  const html = buildReceiptHtml(data);

  // ── Electron Desktop App: use IPC → silent/direct print to printer (bypasses Windows dialog error)
  const electronAPI = (window as any).electronAPI;
  if (electronAPI?.printHtml) {
    electronAPI.printHtml({
      html,
      printerName: options?.printerName,
      silent: options?.silent ?? true, // Default: true for fast direct POS thermal printing
    }).catch((err: unknown) => {
      console.error("[Receipt] Electron print failed:", err);
    });
    return;
  }

  // ── Browser Fallback: open popup window and trigger window.print()
  const popup = window.open(
    "",
    "desert-bite-receipt",
    "width=460,height=700,left=200,top=80,scrollbars=yes,resizable=yes"
  );

  if (!popup) {
    // Last resort: data URI tab if popup was blocked
    const encoded = encodeURIComponent(html);
    const tab = window.open(`data:text/html;charset=utf-8,${encoded}`, "_blank");
    if (tab && autoPrint) {
      tab.onload = () => { tab.focus(); tab.print(); };
      setTimeout(() => { tab.focus(); tab.print(); }, 600);
    }
    return;
  }

  popup.document.open();
  popup.document.write(html);
  popup.document.close();

  if (autoPrint) {
    popup.onload = () => { popup.focus(); popup.print(); };
    setTimeout(() => { popup.focus(); popup.print(); }, 500);
  }
}
