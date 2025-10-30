/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
  Header,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { ReportsQueryDto, ReportType } from './dto/reports-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DriverReportDto, MerchantReportDto } from './dto/reports-response.dto';
import * as ExcelJS from 'exceljs';

function getDisplayStatus(status: string): string {
  switch (status) {
    case 'PENDING':
    case 'IN_WAREHOUSE':
      return 'Pending';
    case 'ON_DELIVERY':
      return 'On Delivery';
    case 'DELIVERED':
    case 'RECEIVED':
      return 'Delivered';
    case 'FAILED':
      return 'Failed';
    case 'RETURNED':
      return 'Returned';
    default:
      return status;
  }
}

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('debug')
  debug(@Query() query: Record<string, unknown>) {
    return {
      message: 'Reports API is working',
      query,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async getReports(
    @Query(new ValidationPipe({ transform: true })) query: ReportsQueryDto,
  ) {
    try {
      return await this.reportsService.getReports(query);
    } catch (error) {
      console.error('Reports API Error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to get reports: ${errorMessage}`);
    }
  }

  @Get('drivers')
  async getDriverReports(
    @Query(new ValidationPipe({ transform: true })) query: ReportsQueryDto,
  ) {
    return this.reportsService.getReports({
      ...query,
      type: ReportType.DRIVER,
    });
  }

  @Get('merchants')
  async getMerchantReports(
    @Query(new ValidationPipe({ transform: true })) query: ReportsQueryDto,
  ) {
    return this.reportsService.getReports({
      ...query,
      type: ReportType.MERCHANT,
    });
  }

  @Get('driver-performance')
  async getDriverPerformance(
    @Query('driverId') driverId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getDriverPerformance(
      driverId,
      startDate,
      endDate,
    );
  }

  @Get('merchant-performance')
  async getMerchantPerformance(
    @Query('merchantId') merchantId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getMerchantPerformance(
      merchantId,
      startDate,
      endDate,
    );
  }

  @Get('export/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="delivery_report.csv"')
  async exportToCSV(
    @Query(new ValidationPipe({ transform: true })) query: ReportsQueryDto,
    @Res() res: Response,
  ) {
    const reports = await this.reportsService.getReports(query);

    // Create enhanced CSV with summary and better formatting
    const summary = [
      'DYHE DELIVERY REPORT',
      `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      '',
      'SUMMARY:',
      `Total Package,${reports.analytics.totalPackages}`,
      `Total Amount,$${reports.analytics.totalCOD.toFixed(2)}`,
      `Delivered Packages,${reports.analytics.deliveredPackages}`,
      `Pending Packages,${reports.analytics.pendingPackages}`,
      `Cancelled Packages,${reports.analytics.cancelledPackages}`,
      `Returned Packages,${reports.analytics.returnedPackages}`,
      '',
    ];

    // Create CSV headers with better formatting
    const headers = [
      'ID',
      'Shipment Create Date',
      'Shipment Delivery Date',
      'Receiver Name',
      'Address',
      'Contact',
      'Tracking#',
      'Cash Collection Amount',
      'Driver',
      'Merchant',
      'Status',
    ];

    // Create CSV content with better formatting
    const csvContent = [
      ...summary,
      'DETAILED PACKAGE LIST:',
      '',
      headers.join(','),
      ...reports.data.map(
        (item: DriverReportDto | MerchantReportDto, index: number) => {
          const deliveryDate = item.shipmentDeliveryDate
            ? new Date(item.shipmentDeliveryDate).toLocaleDateString() +
              ' ' +
              new Date(item.shipmentDeliveryDate).toLocaleTimeString()
            : 'Not Delivered';

          return [
            index + 1,
            new Date(item.shipmentCreateDate).toLocaleDateString() +
              ' ' +
              new Date(item.shipmentCreateDate).toLocaleTimeString(),
            deliveryDate,
            `"${item.receiverName}"`,
            `"${item.address}"`,
            `"${item.contact}"`,
            `"${item.trackingNumber}"`,
            item.cashCollectionAmount > 0
              ? `$${item.cashCollectionAmount.toFixed(2)}`
              : '$0.00',
            `"${item.driverName || 'Not Assigned'}"`,
            `"${item.merchantName}"`,
            `"${item.status}"`,
          ].join(',');
        },
      ),
      '',
      'END OF REPORT',
    ].join('\n');

    res.send(csvContent);
  }

  @Get('export/excel-per-merchant')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportExcelPerMerchant(
    @Query('merchantId') merchantId: string,
    @Res() res: Response,
    @Query('date') date?: string, // YYYY-MM-DD in Asia/Phnom_Penh
  ) {
    try {
      if (!merchantId) {
        throw new BadRequestException('merchantId is required');
      }

      const { merchant, label, inputPackages, historicalPackages } =
        await this.reportsService.buildMerchantWorkbook(merchantId, date);

      const workbook = new ExcelJS.Workbook();

      const formatDateTime = (isoDate?: string | Date) => {
        if (!isoDate) return '';
        const d = new Date(isoDate);
        const yy = String(d.getFullYear()).slice(-2);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        if (hours === 0) hours = 12;
        const hh = String(hours).padStart(2, '0');
        return `${dd}-${mm}-${yy} ${hh}:${minutes} ${ampm}`;
      };

      const formatDateShort = (isoDate?: string | Date) => {
        if (!isoDate) return '';
        const d = new Date(isoDate);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const yy = String(d.getFullYear()).slice(-2);
        const mm = months[d.getMonth()];
        const dd = String(d.getDate()).padStart(2, '0');
        return `${dd}-${mm}-${yy}`;
      };

      const labelShort = (() => {
        const [y, m, d] = label.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${d}-${monthNames[parseInt(m, 10) - 1]}-${String(parseInt(y, 10)).slice(-2)}`;
      })();

      // === BEGIN Sheet 2/Delivery Report stats and metrics ===
      const packages = inputPackages; // for the day
      const totalCount = packages.length;
      const deliveredCount = packages.filter(p => p.status === 'DELIVERED').length;
      const pendingCount = packages.filter(p => p.status !== 'DELIVERED').length;
      // Sums:
      const totalCOD = packages.reduce((sum, p) => sum + Number(p.codAmount), 0);
      const collectedCOD = packages.filter(p => p.status === 'DELIVERED').reduce((sum, p) => sum + Number(p.codAmount), 0);
      const uncollectedCOD = packages.filter(p => p.status !== 'DELIVERED').reduce((sum, p) => sum + Number(p.codAmount), 0);
      const totalDeliveryFee = packages.reduce((sum, p) => sum + Number(p.deliveryFee), 0);
      const outstanding = uncollectedCOD;
      const toSettle = collectedCOD - 15;
      // === END Sheet 2/Delivery Report stats and metrics ===

      // Sheet 1: Input Packages (selected date)
      const pickupSheet = workbook.addWorksheet(`Pick up ${labelShort}`);
      const pickupHeaders = [
        'ID',
        'Shipment Create Date',
        'Shipment Delivery Date',
        'Receiver Name',
        'Address',
        'Contact',
        'Tracking#',
        'Cash Collection Amount',
      ];
      const pickupHeaderRow = pickupSheet.addRow(pickupHeaders);
      pickupHeaderRow.eachCell((cell) => {
        cell.font = { bold: true } as any;
      });
      let totalAmount = 0;
      const statusMap = {};
      inputPackages.forEach((pkg, index) => {
        // Include ALL statuses
        const deliveredDate = pkg.status === 'DELIVERED' && pkg.updatedAt ? formatDateTime(pkg.updatedAt) : '';
        const cash = Number(pkg.codAmount) || 0;
        totalAmount += cash;
        // Summary by status
        if (!statusMap[getDisplayStatus(pkg.status)]) {
          statusMap[getDisplayStatus(pkg.status)] = { count: 0, amount: 0 };
        }
        statusMap[getDisplayStatus(pkg.status)].count += 1;
        statusMap[getDisplayStatus(pkg.status)].amount += cash;
        pickupSheet.addRow([
          index + 1,
          formatDateTime(pkg.createdAt),
          deliveredDate,
          pkg.customerName,
          pkg.customerAddress,
          pkg.customerPhone,
          pkg.packageNumber,
          cash,
        ]);
      });
      pickupSheet.columns = [
        { width: 6 },  // ID
        { width: 20 }, // Shipment Create Date
        { width: 20 }, // Shipment Delivery Date
        { width: 20 }, // Receiver Name
        { width: 35 }, // Address
        { width: 18 }, // Contact
        { width: 22 }, // Tracking#
        { width: 18 }, // Cash Collection Amount
      ];
      // Total rows
      const totalPackageRow = pickupSheet.addRow([ '', '', '', '', '', '', 'Total Package', inputPackages.length ]);
      const totalAmountRow = pickupSheet.addRow([ '', '', '', '', '', '', 'Total Amount', totalAmount ]);
      // Style bottom rows (yellow background like example)
      [totalPackageRow, totalAmountRow].forEach(row => {
        row.eachCell((cell, colNumber) => {
          if (colNumber >= 7) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEF3C7' } // yellow
            };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
        });
      });
      // Summary by status
      pickupSheet.addRow([]); // Blank row
      const sbHeader = pickupSheet.addRow(['', '', '', '', '', '', 'Summary by Status']);
      sbHeader.eachCell((cell, colNumber) => {
        if (colNumber >= 7) {
          cell.font = { bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
      const sbTableHeader = pickupSheet.addRow(['', '', '', '', '', '', 'Status', 'Count', 'Amount']);
      sbTableHeader.eachCell((cell, colNumber) => {
        if (colNumber >= 7) {
          cell.font = { bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
      Object.entries(statusMap).forEach(([status, info]) => {
        pickupSheet.addRow(['', '', '', '', '', '', status, (info as { count: number }).count, (info as { amount: number }).amount]);
      });

      // Sheet 2: Delivery report (new improved layout + COLORS)
      const deliverySheet = workbook.addWorksheet(`Delivery report ${labelShort}`);
      let rowPtr = 1;
      // HEADER ROWS
      // 1. Shop Name (blue background, white bold)
      deliverySheet.getCell(rowPtr, 1).value = 'ឈ្មោះហាង ៖';
      deliverySheet.getCell(rowPtr, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      deliverySheet.getCell(rowPtr, 1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      deliverySheet.getCell(rowPtr, 1).alignment = { vertical: 'middle', horizontal: 'left' };
      deliverySheet.getCell(rowPtr, 3).value = merchant.name;
      deliverySheet.getCell(rowPtr, 3).font = { bold: true };
      rowPtr++;
      // 2. Bank info (blue background, white bold)
      deliverySheet.getCell(rowPtr, 1).value = 'ឈ្មោះធនាគារ ៖';
      deliverySheet.getCell(rowPtr, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      deliverySheet.getCell(rowPtr, 1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      deliverySheet.getCell(rowPtr, 1).alignment = { vertical: 'middle', horizontal: 'left' };
      deliverySheet.getCell(rowPtr, 3).value = merchant.bankAccountName || merchant.bank || '';
      deliverySheet.getCell(rowPtr, 3).font = { bold: true };
      rowPtr++;
      // 3. Report date (blue background, white bold)
      deliverySheet.getCell(rowPtr, 1).value = 'កាលបរិច្ឆេទរបាយការណ៍ ៖';
      deliverySheet.getCell(rowPtr, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      deliverySheet.getCell(rowPtr, 1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      deliverySheet.getCell(rowPtr, 1).alignment = { vertical: 'middle', horizontal: 'left' };
      deliverySheet.getCell(rowPtr, 3).value = label;
      deliverySheet.getCell(rowPtr, 3).font = { bold: true };
      rowPtr += 2;
      // COLOR SUMMARY METRIC HEADERS
      // Black header cells, green, orange, blue backgrounds
      deliverySheet.getCell(rowPtr, 2).value = 'ចំនួនកញ្ចប់សរុប';
      deliverySheet.getCell(rowPtr, 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
      deliverySheet.getCell(rowPtr, 2).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      deliverySheet.getCell(rowPtr, 3).value = totalCount;
      deliverySheet.getCell(rowPtr, 3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22223B' } };
      deliverySheet.getCell(rowPtr, 3).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      deliverySheet.getCell(rowPtr, 5).value = 'បានបញ្ចប់';
      deliverySheet.getCell(rowPtr, 5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF166534' } };
      deliverySheet.getCell(rowPtr, 5).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      deliverySheet.getCell(rowPtr, 6).value = deliveredCount;
      deliverySheet.getCell(rowPtr, 6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC3F1D6' } };
      deliverySheet.getCell(rowPtr, 6).font = { color: { argb: 'FF000000' }, bold: true };
      deliverySheet.getCell(rowPtr, 8).value = 'មិនទាន់បញ្ចប់';
      deliverySheet.getCell(rowPtr, 8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFBD59' } };
      deliverySheet.getCell(rowPtr, 8).font = { color: { argb: 'FF000000' }, bold: true };
      deliverySheet.getCell(rowPtr, 9).value = pendingCount;
      deliverySheet.getCell(rowPtr, 9).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7DE' } };
      deliverySheet.getCell(rowPtr, 9).font = { color: { argb: 'FF000000' }, bold: true };
      rowPtr++;
      // COLOR FINANCIAL METRICS
      deliverySheet.getCell(rowPtr, 2).value = 'តម្លៃទំនិញទាំងអស់';
      deliverySheet.getCell(rowPtr, 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
      deliverySheet.getCell(rowPtr, 2).font = { color: { argb: 'FF000000' }, bold: true };
      deliverySheet.getCell(rowPtr, 3).value = `$${totalCOD}`;
      deliverySheet.getCell(rowPtr, 3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFFF9' } };
      deliverySheet.getCell(rowPtr, 3).font = { color: { argb: 'FF064E3B' }, bold: true };

      deliverySheet.getCell(rowPtr, 5).value = 'ទឹកប្រាក់ប្រមូលបានសរុប';
      deliverySheet.getCell(rowPtr, 5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBBF7D0' } };
      deliverySheet.getCell(rowPtr, 5).font = { color: { argb: 'FF166534' }, bold: true };
      deliverySheet.getCell(rowPtr, 6).value = `$${collectedCOD}`;
      deliverySheet.getCell(rowPtr, 6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
      deliverySheet.getCell(rowPtr, 6).font = { color: { argb: 'FF166534' }, bold: true };

      deliverySheet.getCell(rowPtr, 8).value = 'ទឹកប្រាក់មិនទាន់ប្រមូល';
      deliverySheet.getCell(rowPtr, 8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE68A' } };
      deliverySheet.getCell(rowPtr, 8).font = { color: { argb: 'FFD97706' }, bold: true };
      deliverySheet.getCell(rowPtr, 9).value = `$${uncollectedCOD}`;
      deliverySheet.getCell(rowPtr, 9).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } };
      deliverySheet.getCell(rowPtr, 9).font = { color: { argb: 'FFD97706' }, bold: true };

      deliverySheet.getCell(rowPtr, 11).value = 'ថ្លៃដឹកសរុប';
      deliverySheet.getCell(rowPtr, 11).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
      deliverySheet.getCell(rowPtr, 11).font = { color: { argb: 'FF2563EB' }, bold: true };
      deliverySheet.getCell(rowPtr, 12).value = `$${totalDeliveryFee}`;
      deliverySheet.getCell(rowPtr, 12).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } };
      deliverySheet.getCell(rowPtr, 12).font = { color: { argb: 'FF2563EB' }, bold: true };

      deliverySheet.getCell(rowPtr, 14).value = 'ទឹកប្រាក់ជំពាក់';
      deliverySheet.getCell(rowPtr, 14).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
      deliverySheet.getCell(rowPtr, 14).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      deliverySheet.getCell(rowPtr, 15).value = `$${outstanding}`;
      deliverySheet.getCell(rowPtr, 15).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE5E5' } };
      deliverySheet.getCell(rowPtr, 15).font = { color: { argb: 'FFDC2626' }, bold: true };
      // Next row: strong blue
      deliverySheet.getCell(rowPtr, 17).value = 'ទឹកប្រាក់ដែរត្រូវទូរទាត់';
      deliverySheet.getCell(rowPtr, 17).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
      deliverySheet.getCell(rowPtr, 17).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      deliverySheet.getCell(rowPtr, 18).value = `$${toSettle}`;
      deliverySheet.getCell(rowPtr, 18).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5FAFC' } };
      deliverySheet.getCell(rowPtr, 18).font = { color: { argb: 'FF2563EB' }, bold: true };
      rowPtr+=2;
      // TABLE HEADER for details (light blue, bold)
      const detailHeaders = ['No', 'Shipment Create Date', 'Receiver Name', 'Address', 'Contact', 'Tracking#', 'Status', 'COD', 'Pick Fee', 'Taxi Fee', 'Delivery Fee', 'Packaging Fee', 'Remark'];
      detailHeaders.forEach((header, i) => {
        const c = deliverySheet.getCell(rowPtr, i+1);
        c.value = header;
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
        c.font = { bold: true, color: { argb: 'FF000000' } };
        c.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      rowPtr++;
      // Detail rows (no color, just alternating light gray)
      packages.forEach((pkg, idx) => {
        const isDelivered = pkg.status === 'DELIVERED';
        for (let col = 1; col <= detailHeaders.length; col++) {
          let cell = deliverySheet.getCell(rowPtr, col);
          if (idx % 2 === 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
          }
        }
        deliverySheet.getCell(rowPtr, 1).value = idx+1;
        deliverySheet.getCell(rowPtr, 2).value = formatDateTime(pkg.createdAt);
        deliverySheet.getCell(rowPtr, 3).value = pkg.customerName;
        deliverySheet.getCell(rowPtr, 4).value = pkg.customerAddress;
        deliverySheet.getCell(rowPtr, 5).value = pkg.customerPhone;
        deliverySheet.getCell(rowPtr, 6).value = pkg.packageNumber;
        deliverySheet.getCell(rowPtr, 7).value = getDisplayStatus(pkg.status);
        deliverySheet.getCell(rowPtr, 8).value = Number(pkg.codAmount) || '';
        deliverySheet.getCell(rowPtr, 9).value = '$0'; // Pick Fee
        deliverySheet.getCell(rowPtr, 10).value = '$0'; // Taxi Fee
        deliverySheet.getCell(rowPtr, 11).value = pkg.deliveryFee ? `$${pkg.deliveryFee}` : ''; // Delivery Fee
        deliverySheet.getCell(rowPtr, 12).value = '$0'; // Packaging Fee
        deliverySheet.getCell(rowPtr, 13).value = '';
        rowPtr++;
      });
      // TOTAL/FEE SUMMARY ROWS (yellow highlight for labels and figures)
      [
        { label: 'Total Cash', col: 4, val: `$${collectedCOD}` },
        { label: 'Total Expenses Entry', col: 4, val: '$0' },
        { label: 'Total Expenses', col: 4, val: '$15' },
        { label: 'Total Outstanding Balance', col: 4, val: `$${outstanding}` },
        { label: 'Deduct Fee After Expenses', col: 4, val: `$${toSettle}` },
      ].forEach((row, i) => {
        deliverySheet.getCell(rowPtr, row.col).value = row.label;
        deliverySheet.getCell(rowPtr, row.col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
        deliverySheet.getCell(rowPtr, row.col).font = { bold: true, color: { argb: 'FF000000' } };
        deliverySheet.getCell(rowPtr, row.col+4).value = row.val;
        deliverySheet.getCell(rowPtr, row.col+4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
        deliverySheet.getCell(rowPtr, row.col+4).font = { bold: true, color: { argb: 'FF000000' } };
        rowPtr++;
      });
      rowPtr+=1;
      // OUTSTANDING DETAIL (orange/yellow bg, then white rows)
      deliverySheet.getCell(rowPtr, 2).value = 'Outstanding Detail';
      deliverySheet.getCell(rowPtr, 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFED7AA' } };
      deliverySheet.getCell(rowPtr, 2).font = { color: { argb: 'FF000000' }, bold: true };
      rowPtr++;
      deliverySheet.getCell(rowPtr, 2).value = 'Outstanding Date';
      deliverySheet.getCell(rowPtr, 3).value = 'Outstanding Balance';
      deliverySheet.getCell(rowPtr, 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      deliverySheet.getCell(rowPtr, 3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      deliverySheet.getCell(rowPtr, 2).font = { bold: true };
      deliverySheet.getCell(rowPtr, 3).font = { bold: true };
      rowPtr++;
      deliverySheet.getCell(rowPtr, 2).value = 'Total';
      deliverySheet.getCell(rowPtr, 3).value = '$0';
      deliverySheet.getCell(rowPtr, 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      deliverySheet.getCell(rowPtr, 3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      deliverySheet.getCell(rowPtr, 2).font = { bold: true };
      deliverySheet.getCell(rowPtr, 3).font = { bold: true };
      rowPtr++;

      // Set column widths for delivery sheet
      deliverySheet.columns = [
        { width: 8 }, // No
        { width: 20 }, // Shipment Create Date
        { width: 18 }, // Receiver Name
        { width: 30 }, // Address
        { width: 16 }, // Contact
        { width: 22 }, // Tracking#
        { width: 20 }, // Status
        { width: 12 }, // COD
        { width: 12 }, // Pick Fee
        { width: 12 }, // Taxi Fee
        { width: 12 }, // Delivery Fee
        { width: 12 }, // Packaging Fee
        { width: 15 }, // Remark
        { width: 8 }, // Empty
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      const safeName = merchant.name.replace(/[^A-Za-z0-9 _-]+/g, '').replace(/\s+/g, '_');
      const filename = `DYHE_Report_${safeName}_${label}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('Excel Per-Merchant Export Error:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to export per-merchant Excel: ${msg}`);
    }
  }
}
