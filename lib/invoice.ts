/**
 * Euphoria — PDF Invoice Generator
 * SOP §৬B — Order Management (Auto-generated on confirm)
 *
 * Generates a branded PDF invoice for orders
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { BUSINESS, CURRENCY } from "./constants";

interface InvoiceItem {
  name: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceData {
  orderNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: {
    street: string;
    area: string;
    city: string;
    postalCode: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  shippingCharge: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}

/**
 * Generate PDF invoice as base64 data URL
 */
export function generateInvoice(data: InvoiceData): string {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(BUSINESS.NAME, 20, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(BUSINESS.ADDRESS, 20, 33);
  doc.text(`Phone: ${BUSINESS.PHONE} | Email: ${BUSINESS.EMAIL}`, 20, 39);

  // Invoice title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("INVOICE", 150, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Order: ${data.orderNumber}`, 150, 33);
  doc.text(`Date: ${data.date}`, 150, 39);
  doc.text(`Payment: ${data.paymentMethod}`, 150, 45);

  // Divider
  doc.setDrawColor(200);
  doc.line(20, 52, 190, 52);

  // Bill To
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 20, 62);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.customerName, 20, 69);
  doc.text(data.customerPhone, 20, 75);
  if (data.customerEmail) doc.text(data.customerEmail, 20, 81);
  doc.text(`${data.address.street}, ${data.address.area}`, 20, data.customerEmail ? 87 : 81);
  doc.text(`${data.address.city} - ${data.address.postalCode}`, 20, data.customerEmail ? 93 : 87);

  // Items Table
  const tableStartY = data.customerEmail ? 103 : 97;

  const tableData = data.items.map((item, index) => [
    (index + 1).toString(),
    `${item.name}${item.size ? ` (${item.size})` : ""}${item.color ? ` - ${item.color}` : ""}`,
    item.quantity.toString(),
    `${CURRENCY.SYMBOL}${item.unitPrice.toLocaleString()}`,
    `${CURRENCY.SYMBOL}${item.totalPrice.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [["#", "Item", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: [255, 255, 255],
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 80 },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
    },
  });

  // Summary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  const summaryX = 130;
  doc.setFontSize(10);

  doc.text("Subtotal:", summaryX, finalY);
  doc.text(`${CURRENCY.SYMBOL}${data.subtotal.toLocaleString()}`, 180, finalY, { align: "right" });

  doc.text("Shipping:", summaryX, finalY + 7);
  doc.text(`${CURRENCY.SYMBOL}${data.shippingCharge.toLocaleString()}`, 180, finalY + 7, {
    align: "right",
  });

  if (data.discount > 0) {
    doc.text("Discount:", summaryX, finalY + 14);
    doc.setTextColor(0, 128, 0);
    doc.text(`-${CURRENCY.SYMBOL}${data.discount.toLocaleString()}`, 180, finalY + 14, {
      align: "right",
    });
    doc.setTextColor(0);
  }

  const totalY = data.discount > 0 ? finalY + 24 : finalY + 17;
  doc.setDrawColor(200);
  doc.line(summaryX, totalY - 3, 190, totalY - 3);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total:", summaryX, totalY + 4);
  doc.text(`${CURRENCY.SYMBOL}${data.total.toLocaleString()}`, 180, totalY + 4, { align: "right" });

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text("Thank you for shopping with Euphoria!", 105, 280, { align: "center" });
  doc.text("This is a computer-generated invoice. No signature required.", 105, 285, {
    align: "center",
  });

  // Return as base64
  return doc.output("datauristring");
}
