import { jsPDF } from "jspdf";
import { generateQRCode } from "./qrcode";

export interface PdfLabelPackage {
  id: string;
  packageNumber: string;
  name: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  codAmount: number | string;
  merchant: { name: string };
}

const PAGE_W = 101.6; // mm (4in) - matches 4x6 paper width
const PAGE_H = 152.4; // mm (6in) - matches 4x6 paper height

async function drawLabelOnDoc(doc: jsPDF, pkg: PdfLabelPackage) {
  // Center the label content horizontally only (X-axis), keep at top (Y-axis)
  const labelWidth = 80; // mm - actual label width
  const labelHeight = 100; // mm - actual label height
  const marginX = (PAGE_W - labelWidth) / 2; // Center horizontally only
  const marginY = 1; // Fixed top margin, not centered vertically
  const contentWidth = labelWidth - 10; // Internal content width

  // Clear any styles
  doc.setDrawColor(0);
  doc.setTextColor(0);

  // Border - centered on the paper
  doc.setLineWidth(0.6);
  doc.rect(marginX + 5, marginY + 3, contentWidth, labelHeight - 6);

  // Header - centered within the label area
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DYHE DELIVERY", marginX + labelWidth / 2, marginY + 10, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(
    "#123, Street 456, Phnom Penh",
    marginX + labelWidth / 2,
    marginY + 13,
    {
      align: "center",
    }
  );
  doc.text("Tel: +855 12 345 678", marginX + labelWidth / 2, marginY + 16, {
    align: "center",
  });

  // Divider
  doc.line(marginX + 5, marginY + 18, marginX + labelWidth - 5, marginY + 18);

  // Content rows - positioned within the centered label
  let y = marginY + 22;
  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text(label, marginX + 6, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(value, marginX + 23, y, { maxWidth: contentWidth - 25 });
    y += 4.5;
  };

  row("FROM:", pkg.merchant.name);
  row("TO:", pkg.customerName);
  row("PHONE:", pkg.customerPhone);
  row("ADDRESS:", pkg.customerAddress);
  row("PACKAGE:", pkg.name);
  row("COD:", `$${Number(pkg.codAmount).toFixed(2)}`);
  row("DATE:", new Date().toLocaleDateString());

  // QR code - centered within the label area
  const qr = await generateQRCode(pkg.packageNumber, { width: 180, margin: 1 });
  const qrSize = 18; // mm - compact size for narrow label
  const qrX = marginX + labelWidth / 2 - qrSize / 2; // Center within label
  const qrY = y + 2;
  doc.addImage(qr, "PNG", qrX, qrY, qrSize, qrSize, undefined, "FAST");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(pkg.packageNumber, marginX + labelWidth / 2, qrY + qrSize + 3, {
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
