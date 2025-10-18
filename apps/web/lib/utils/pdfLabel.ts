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
  doc.setLineWidth(0.8);
  doc.rect(marginX + 5, marginY + 3, contentWidth, labelHeight - 6);

  // Define section heights based on the wireframe
  const headerHeight = 18; // Top section
  const middleHeight = 50; // Middle section

  const headerY = marginY + 5;
  const middleY = headerY + headerHeight;
  const footerY = middleY + middleHeight;

  // Company info on left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("DYHE DELIVERY", marginX + 7, headerY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text("#123, Street 456, Phnom Penh", marginX + 7, headerY + 10);
  doc.text("Tel: +855 12 345 678", marginX + 7, headerY + 14);

  // Tracking info on right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("Tracking#:", marginX + 45, headerY + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(pkg.packageNumber, marginX + 45, headerY + 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("DATE:", marginX + 45, headerY + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(new Date().toLocaleDateString(), marginX + 45, headerY + 17);

  // Horizontal divider between header and middle
  doc.setLineWidth(0.8);
  doc.line(marginX + 5, middleY, marginX + labelWidth - 5, middleY);

  // Vertical divider for two columns
  const leftColWidth = contentWidth * 0.4; // Left column ~40%
  doc.setLineWidth(0.8);
  doc.line(
    marginX + 5 + leftColWidth,
    middleY,
    marginX + 5 + leftColWidth,
    footerY
  );

  // Horizontal divider between left sections
  const leftSectionHeight = (middleHeight - 2) / 2;
  doc.setLineWidth(0.8);
  doc.line(
    marginX + 5,
    middleY + leftSectionHeight,
    marginX + 5 + leftColWidth,
    middleY + leftSectionHeight
  );

  // FROM section (top left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("FROM", marginX + 7, middleY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(pkg.merchant.name, marginX + 7, middleY + 9);

  // SHIP TO section (bottom left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("SHIP TO", marginX + 7, middleY + leftSectionHeight + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(pkg.customerName, marginX + 7, middleY + leftSectionHeight + 9);
  doc.text(pkg.customerPhone, marginX + 7, middleY + leftSectionHeight + 13);
  doc.text(pkg.customerAddress, marginX + 7, middleY + leftSectionHeight + 17, {
    maxWidth: leftColWidth - 4,
  });

  // RIGHT COLUMN - Package details and QR code
  const rightStartX = marginX + 5 + leftColWidth + 2;
  let rightY = middleY + 5;

  // Package details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("PACKAGE#:", rightStartX, rightY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text("1", rightStartX, rightY + 4);

  rightY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("SHP WT#:", rightStartX, rightY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text("1", rightStartX, rightY + 4);

  rightY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("COD in USD:", rightStartX, rightY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(`$${Number(pkg.codAmount).toFixed(2)}`, rightStartX, rightY + 4);

  // QR code in right column
  const qr = await generateQRCode(pkg.packageNumber, { width: 120, margin: 1 });
  const qrSize = 12; // mm
  const qrX = rightStartX + 15;
  const qrY = middleY + 25;
  doc.addImage(qr, "PNG", qrX, qrY, qrSize, qrSize, undefined, "FAST");

  // Horizontal divider between middle and footer
  doc.setLineWidth(0.8);
  doc.line(marginX + 5, footerY, marginX + labelWidth - 5, footerY);

  // Remarks
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("REMARKS", marginX + 7, footerY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(4);
  doc.text(
    "DYHE Express does not accept illegal goods or animals.",
    marginX + 7,
    footerY + 9,
    { maxWidth: contentWidth - 4 }
  );
  doc.text(
    "We reserve the right to refuse delivery if goods are suspected to be illegal.",
    marginX + 7,
    footerY + 13,
    { maxWidth: contentWidth - 4 }
  );
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
