# Package Label Printing Feature

## Overview

This feature allows users to generate and print package labels with barcodes/QR codes for each package. The labels include all necessary shipping information and can be printed on standard 4" x 6" label paper.

## Features

### 1. Label Generation

- **Single Print Mode**: Choose individual packages for printing
- **Bulk Print Mode**: Select multiple packages for batch printing
- **Live Preview**: See exactly how the label will look before printing
- **Search Functionality**: Find packages quickly by name or package number
- **Real QR Codes**: Generate actual scannable QR codes using qrcode.js

### 2. Label Content

Each printed label includes:

- **Company Information**: DYHE DELIVERY with address and contact details
- **Shipping Details**:
  - FROM: Merchant name
  - TO: Customer name
  - PHONE: Customer phone number
  - ADDRESS: Customer address
  - PACKAGE: Package name/description
  - COD: Cash on delivery amount in USD
  - DATE: Print date
- **QR Code**: Scannable code with package number
- **Tracking Number**: Package number for tracking

### 3. Print Options

- **Single Print**: Print individual package labels
- **Bulk Print**: Print multiple package labels at once
- **Direct Print**: Print immediately to default printer
- **Print Preview**: See label layout before printing
- **Label Size**: Optimized for 4" x 6" labels

## Usage

### From Packages List

1. Go to the Packages page
2. Click the **Print** button (printer icon) next to any package
3. The print dialog will open with the formatted label
4. Print to your label printer

### From Print Page

1. Navigate to `/packages/print`
2. Choose between "Single Print" or "Bulk Print" mode
3. **Single Mode**: Search and select a package, preview, then print
4. **Bulk Mode**: Select multiple packages using checkboxes, then print all at once
5. Each label prints on a separate page for easy separation

## Label Specifications

- **Size**: 4" x 6" (102mm x 152mm)
- **Format**: HTML/CSS optimized for printing
- **Font**: Arial, 12px base size
- **Border**: 2px solid black border
- **QR Code**: 80x80px real QR code generated using qrcode.js

## Technical Details

### Print Function

The print functionality uses:

- `window.open()` to create a new print window
- CSS `@page` rules for proper sizing
- HTML/CSS for label layout
- Automatic print dialog opening

### Label Template

The label template includes:

- Responsive layout that fits 4" x 6" labels
- Professional company branding
- Clear information hierarchy
- Scannable QR code area
- Tracking number prominently displayed

## Future Enhancements

- Barcode generation for package numbers
- Custom label templates
- Print history and tracking
- Integration with label printer APIs
- Advanced QR code customization options
- Print queue management

## Printer Setup

For best results:

1. Use a thermal label printer (4" x 6" labels)
2. Set printer to 300 DPI resolution
3. Use high-quality label paper
4. Test print alignment before bulk printing
