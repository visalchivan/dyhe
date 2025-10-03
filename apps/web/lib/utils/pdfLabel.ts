import { jsPDF } from "jspdf";
import { generateQRCode } from "./qrcode";

export interface PdfLabelPackage {
  id: string;
  packageNumber: string;
  name: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  codAmount: number;
  merchant: { name: string };
}

const PAGE_W = 101.6; // mm (4in)
const PAGE_H = 152.4; // mm (6in)

async function drawLabelOnDoc(doc: jsPDF, pkg: PdfLabelPackage) {
  const marginX = 5;
  const contentWidth = PAGE_W - marginX * 2;

  // Clear any styles
  doc.setDrawColor(0);
  doc.setTextColor(0);

  // Border
  doc.setLineWidth(0.6);
  doc.rect(marginX, 5, contentWidth, PAGE_H - 10);

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("DYHE DELIVERY", PAGE_W / 2, 12, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("#123, Street 456, Phnom Penh, Cambodia", PAGE_W / 2, 16, {
    align: "center",
  });
  doc.text("Tel: +855 12 345 678 | info@dyhe.com", PAGE_W / 2, 19, {
    align: "center",
  });

  // Divider
  doc.line(marginX, 22, PAGE_W - marginX, 22);

  // Content rows
  let y = 26;
  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(label, marginX + 1, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(value, marginX + 26, y, { maxWidth: contentWidth - 28 });
    y += 6;
  };

  row("FROM:", pkg.merchant.name);
  row("TO:", pkg.customerName);
  row("PHONE:", pkg.customerPhone);
  row("ADDRESS:", pkg.customerAddress);
  row("PACKAGE:", pkg.name);
  row("COD:", `$${pkg.codAmount.toFixed(2)}`);
  row("DATE:", new Date().toLocaleDateString());

  // QR code
  const qr = await generateQRCode(pkg.packageNumber, { width: 300, margin: 1 });
  const qrSize = 30; // mm (~1.18in)
  const qrX = PAGE_W / 2 - qrSize / 2;
  const qrY = y + 4;
  doc.addImage(qr, "PNG", qrX, qrY, qrSize, qrSize, undefined, "FAST");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(pkg.packageNumber, PAGE_W / 2, qrY + qrSize + 6, {
    align: "center",
  });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Scan QR for tracking | www.dyhe.com", PAGE_W / 2, PAGE_H - 6, {
    align: "center",
  });
}

export async function createLabelPdf(pkg: PdfLabelPackage): Promise<jsPDF> {
  const doc = new jsPDF({
    unit: "mm",
    format: [PAGE_W, PAGE_H],
    orientation: "portrait",
  });
  await drawLabelOnDoc(doc, pkg);
  return doc;
}

export async function createBulkLabelsPdf(
  pkgs: PdfLabelPackage[]
): Promise<jsPDF> {
  if (pkgs.length === 0) throw new Error("No packages to print");
  const doc = new jsPDF({
    unit: "mm",
    format: [PAGE_W, PAGE_H],
    orientation: "portrait",
  });
  // First page
  await drawLabelOnDoc(doc, pkgs[0]!);
  // Subsequent pages
  for (let i = 1; i < pkgs.length; i++) {
    doc.addPage([PAGE_W, PAGE_H], "portrait");
    await drawLabelOnDoc(doc, pkgs[i]!);
  }
  return doc;
}

export async function openPdfInNewTab(doc: jsPDF) {
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
