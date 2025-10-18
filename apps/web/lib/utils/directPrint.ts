import { generateQRCode } from "./qrcode";

export interface PrintLabelPackage {
  id: string;
  packageNumber: string;
  name: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  codAmount: number | string;
  merchant: { name: string };
}

/**
 * Generate HTML for a single label
 */
async function generateLabelHTML(pkg: PrintLabelPackage): Promise<string> {
  // Generate QR code as base64 image
  const qrCode = await generateQRCode(pkg.packageNumber, {
    width: 120,
    margin: 1,
  });

  return `
    <div class="label-container">
      <div class="label">
        <!-- Header Section -->
        <div class="header">
          <div class="company-info">
            <div class="company-name">DYHE DELIVERY</div>
            <div class="company-address">#123, Street 456, Phnom Penh</div>
            <div class="company-phone">Tel: +855 12 345 678</div>
          </div>
          <div class="tracking-info">
            <div class="tracking-label">Tracking#:</div>
            <div class="tracking-number">${pkg.packageNumber}</div>
            <div class="date-label">DATE:</div>
            <div class="date-value">${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <!-- Middle Section -->
        <div class="middle">
          <div class="left-column">
            <div class="from-section">
              <div class="section-title">FROM</div>
              <div class="merchant-name">${pkg.merchant.name}</div>
            </div>
            <div class="ship-to-section">
              <div class="section-title">SHIP TO</div>
              <div class="customer-name">${pkg.customerName}</div>
              <div class="customer-phone">${pkg.customerPhone}</div>
              <div class="customer-address">${pkg.customerAddress}</div>
            </div>
          </div>
          <div class="right-column">
            <div class="package-details">
              <div class="detail-row">
                <span class="detail-label">PACKAGE#:</span>
                <span class="detail-value">1</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">SHP WT#:</span>
                <span class="detail-value">1</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">COD in USD:</span>
                <span class="detail-value">$${Number(pkg.codAmount).toFixed(2)}</span>
              </div>
            </div>
            <div class="qr-code">
              <img src="${qrCode}" alt="QR Code" />
            </div>
          </div>
        </div>

        <!-- Footer Section -->
        <div class="footer">
          <div class="remarks-title">REMARKS</div>
          <div class="remarks-text">
            DYHE Express does not accept illegal goods or animals.
            We reserve the right to refuse delivery if goods are suspected to be illegal.
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate CSS for label printing
 */
function generateLabelCSS(): string {
  return `
    <style>
      @page {
        size: 4in 6in;
        margin: 0;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: 'Helvetica', 'Arial', sans-serif;
      }

      .label-container {
        width: 4in;
        height: 6in;
        page-break-after: always;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding-top: 0.04in;
      }

      .label {
        width: 3.15in;
        height: 3.94in;
        border: 2px solid #000;
        padding: 0.2in;
        background: white;
      }

      /* Header */
      .header {
        display: flex;
        justify-content: space-between;
        height: 0.71in;
        padding-bottom: 0.08in;
        border-bottom: 2px solid #000;
      }

      .company-info {
        flex: 1;
      }

      .company-name {
        font-weight: bold;
        font-size: 10pt;
        margin-bottom: 0.04in;
      }

      .company-address,
      .company-phone {
        font-size: 6pt;
        line-height: 1.4;
      }

      .tracking-info {
        text-align: right;
      }

      .tracking-label,
      .date-label {
        font-weight: bold;
        font-size: 7pt;
        margin-bottom: 0.02in;
      }

      .tracking-number,
      .date-value {
        font-size: 6pt;
        margin-bottom: 0.06in;
      }

      /* Middle Section */
      .middle {
        display: flex;
        height: 1.97in;
        border-bottom: 2px solid #000;
      }

      .left-column {
        width: 40%;
        border-right: 2px solid #000;
        display: flex;
        flex-direction: column;
      }

      .from-section,
      .ship-to-section {
        padding: 0.08in;
        flex: 1;
      }

      .from-section {
        border-bottom: 2px solid #000;
      }

      .section-title {
        font-weight: bold;
        font-size: 7pt;
        margin-bottom: 0.04in;
      }

      .merchant-name {
        font-size: 6pt;
      }

      .customer-name {
        font-size: 6pt;
        margin-bottom: 0.02in;
      }

      .customer-phone {
        font-size: 6pt;
        margin-bottom: 0.02in;
      }

      .customer-address {
        font-size: 6pt;
        line-height: 1.3;
      }

      .right-column {
        width: 60%;
        padding: 0.08in;
        display: flex;
        flex-direction: column;
      }

      .package-details {
        margin-bottom: 0.08in;
      }

      .detail-row {
        margin-bottom: 0.1in;
      }

      .detail-label {
        font-weight: bold;
        font-size: 7pt;
        display: block;
        margin-bottom: 0.02in;
      }

      .detail-value {
        font-size: 6pt;
        display: block;
      }

      .qr-code {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 0.1in;
      }

      .qr-code img {
        width: 0.47in;
        height: 0.47in;
      }

      /* Footer */
      .footer {
        padding: 0.08in 0;
      }

      .remarks-title {
        font-weight: bold;
        font-size: 7pt;
        margin-bottom: 0.04in;
      }

      .remarks-text {
        font-size: 5pt;
        line-height: 1.4;
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
        }

        .label-container {
          page-break-after: always;
        }

        .label-container:last-child {
          page-break-after: auto;
        }
      }

      @media screen {
        body {
          background: #f0f0f0;
          padding: 20px;
        }

        .label-container {
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      }
    </style>
  `;
}

/**
 * Print a single label directly (no PDF)
 */
export async function printLabel(pkg: PrintLabelPackage): Promise<void> {
  const labelHTML = await generateLabelHTML(pkg);
  const css = generateLabelCSS();

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Could not open print window. Please allow popups.");
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Print Label - ${pkg.packageNumber}</title>
        ${css}
      </head>
      <body>
        ${labelHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  // Wait for images (QR code) to load before printing
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Close window after printing (user can cancel this)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }, 250);
  };
}

/**
 * Print multiple labels directly (no PDF)
 */
export async function printBulkLabels(
  pkgs: PrintLabelPackage[]
): Promise<void> {
  if (pkgs.length === 0) {
    throw new Error("No packages to print");
  }

  const labelsHTML = await Promise.all(
    pkgs.map((pkg) => generateLabelHTML(pkg))
  );

  const css = generateLabelCSS();

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Could not open print window. Please allow popups.");
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Print ${pkgs.length} Labels</title>
        ${css}
      </head>
      <body>
        ${labelsHTML.join("\n")}
      </body>
    </html>
  `);

  printWindow.document.close();

  // Wait for images (QR codes) to load before printing
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Close window after printing (user can cancel this)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }, 500);
  };
}
