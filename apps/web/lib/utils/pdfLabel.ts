import { jsPDF } from "jspdf";
import { generateQRCode } from "./qrcode";
import { settingsApi } from "../api/settings";

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

// Cache for settings to avoid repeated API calls
let settingsCache: Record<string, string> | null = null;
let settingsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getSettings(): Promise<Record<string, string>> {
  const now = Date.now();
  if (settingsCache && now - settingsCacheTime < CACHE_DURATION) {
    return settingsCache;
  }

  try {
    settingsCache = await settingsApi.getSettingsAsObject();
    settingsCacheTime = now;
    return settingsCache;
  } catch (error) {
    console.warn("Failed to load settings, using defaults:", error);
    // Return default values if API fails
    return {
      company_name: "DYHE DELIVERY",
      company_phone: "Tel: +855 12 345 678",
      company_address: "#123, Street 456, Phnom Penh",
      label_remarks:
        "DYHE Express does not accept illegal goods or animals.\nWe reserve the right to refuse delivery if goods are suspected to be illegal.",
    };
  }
}

const PAGE_W = 80; // mm - paper width
const PAGE_H = 100; // mm - paper height

async function drawLabelOnDoc(doc: jsPDF, pkg: PdfLabelPackage) {
  // Get settings
  const settings = await getSettings();

  // Use full paper size
  const labelWidth = 76; // mm - actual label width (80mm - 4mm margin)
  const labelHeight = 96; // mm - actual label height (100mm - 4mm margin)
  const marginX = 2; // Left margin
  const marginY = 2; // Top margin
  const contentWidth = labelWidth - 4; // Internal content width

  // Clear any styles
  doc.setDrawColor(0);
  doc.setTextColor(0);

  // Border
  doc.setLineWidth(0.5);
  doc.rect(marginX + 2, marginY + 2, contentWidth, labelHeight - 4);

  // Define section heights based on the wireframe
  const headerHeight = 16; // Top section
  const middleHeight = 48; // Middle section

  const headerY = marginY + 4;
  const middleY = headerY + headerHeight;
  const footerY = middleY + middleHeight;

  // Company info on left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(settings.company_name || "DYHE DELIVERY", marginX + 4, headerY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(
    settings.company_address || "#123, Street 456, Phnom Penh",
    marginX + 4,
    headerY + 9
  );
  doc.text(
    settings.company_phone || "Tel: +855 12 345 678",
    marginX + 4,
    headerY + 12
  );

  // Tracking info on right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("Tracking#:", marginX + 40, headerY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(pkg.packageNumber, marginX + 40, headerY + 9);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("DATE:", marginX + 40, headerY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(new Date().toLocaleDateString(), marginX + 40, headerY + 15);

  // Horizontal divider between header and middle
  doc.setLineWidth(0.5);
  doc.line(marginX + 2, middleY, marginX + labelWidth - 2, middleY);

  // Vertical divider for two columns
  const leftColWidth = contentWidth * 0.4; // Left column ~40%
  doc.setLineWidth(0.5);
  doc.line(
    marginX + 2 + leftColWidth,
    middleY,
    marginX + 2 + leftColWidth,
    footerY
  );

  // Horizontal divider between left sections
  const leftSectionHeight = middleHeight / 2;
  doc.setLineWidth(0.5);
  doc.line(
    marginX + 2,
    middleY + leftSectionHeight,
    marginX + 2 + leftColWidth,
    middleY + leftSectionHeight
  );

  // FROM section (top left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("FROM", marginX + 4, middleY + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(pkg.merchant.name, marginX + 4, middleY + 8);

  // SHIP TO section (bottom left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("SHIP TO", marginX + 4, middleY + leftSectionHeight + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(pkg.customerName, marginX + 4, middleY + leftSectionHeight + 8);
  doc.text(pkg.customerPhone, marginX + 4, middleY + leftSectionHeight + 12);
  doc.text(pkg.customerAddress, marginX + 4, middleY + leftSectionHeight + 16, {
    maxWidth: leftColWidth - 4,
  });

  // RIGHT COLUMN - Package details and QR code
  const rightStartX = marginX + 2 + leftColWidth + 2;
  let rightY = middleY + 4;

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
  const qrSize = 20; // mm
  const qrX = rightStartX + 10;
  const qrY = middleY + 20;
  doc.addImage(qr, "PNG", qrX, qrY, qrSize, qrSize, undefined, "FAST");

  // Horizontal divider between middle and footer
  doc.setLineWidth(0.5);
  doc.line(marginX + 2, footerY, marginX + labelWidth - 2, footerY);

  // Remarks
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("REMARKS", marginX + 4, footerY + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(4);

  const remarks =
    settings.label_remarks ||
    "DYHE Express does not accept illegal goods or animals.\nWe reserve the right to refuse delivery if goods are suspected to be illegal.";
  const remarksLines = remarks.split("\n");

  remarksLines.forEach((line, index) => {
    doc.text(line, marginX + 4, footerY + 7 + index * 3, {
      maxWidth: contentWidth - 4,
    });
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
