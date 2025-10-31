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
      `Generated on: ${new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Phnom_Penh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())} at ${new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Phnom_Penh', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(new Date())}`,
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
            ? new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Phnom_Penh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(item.shipmentDeliveryDate)) +
              ' ' +
              new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Phnom_Penh', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(new Date(item.shipmentDeliveryDate))
            : 'Not Delivered';

          return [
            index + 1,
            new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Phnom_Penh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(item.shipmentCreateDate)) +
              ' ' +
              new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Phnom_Penh', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(new Date(item.shipmentCreateDate)),
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
    @Query('startDate') startDate?: string, // YYYY-MM-DD in Asia/Phnom_Penh
    @Query('endDate') endDate?: string, // YYYY-MM-DD in Asia/Phnom_Penh
  ) {
    try {
      if (!merchantId) throw new BadRequestException('merchantId is required');

      // === Fetch Data ===
      const { merchant, label, inputPackages, historicalPackages } =
        await this.reportsService.buildMerchantWorkbook(merchantId, startDate, endDate);

      // === Initialize Workbook ===
      const workbook = new ExcelJS.Workbook();

      // --------------------------
      // Helpers
      // --------------------------
      // Format date/time in Phnom Penh timezone for Excel export
      const formatDateTime = (isoDate?: string | Date) => {
        if (!isoDate) return '';
        const d = new Date(isoDate);
        // Use Intl.DateTimeFormat to get date/time in Phnom Penh timezone
        const dateParts = new Intl.DateTimeFormat('en-GB', { 
          timeZone: 'Asia/Phnom_Penh',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).formatToParts(d);
        const timeParts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Phnom_Penh',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).formatToParts(d);
        
        const day = dateParts.find(p => p.type === 'day')?.value || '';
        const month = dateParts.find(p => p.type === 'month')?.value || '';
        const year = dateParts.find(p => p.type === 'year')?.value?.slice(-2) || '';
        const hour = timeParts.find(p => p.type === 'hour')?.value || '';
        const minute = timeParts.find(p => p.type === 'minute')?.value || '';
        const ampm = timeParts.find(p => p.type === 'dayPeriod')?.value?.toUpperCase() || '';
        
        return `${day}-${month}-${year} ${hour}:${minute} ${ampm}`;
      };

      // Format date in Phnom Penh timezone for Excel sheet names
      const formatDateShort = (isoDate?: string | Date) => {
        if (!isoDate) return '';
        const d = new Date(isoDate);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        // Get date components in Phnom Penh timezone
        const dateParts = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Phnom_Penh',
          day: '2-digit',
          month: 'numeric',
          year: 'numeric'
        }).formatToParts(d);
        
        const day = dateParts.find(p => p.type === 'day')?.value || '';
        const monthIndex = parseInt(dateParts.find(p => p.type === 'month')?.value || '1') - 1;
        const year = dateParts.find(p => p.type === 'year')?.value?.slice(-2) || '';
        
        return `${day}-${months[monthIndex]}-${year}`;
      };

      const applyStyle = (cell: ExcelJS.Cell, style: Partial<ExcelJS.Style>) => {
        if (!cell || !style) return;
        if (style.fill) cell.fill = style.fill;
        if (style.font) cell.font = style.font;
        if (style.alignment) cell.alignment = style.alignment;
        if (style.border) cell.border = style.border;
        if (style.numFmt) cell.numFmt = style.numFmt;
      };

      const getRowFillColor = (rowIndex: number) => (rowIndex % 2 === 0 ? 'FFFFFFFF' : 'FFF8F9FA');

      const createCurrencyFormat = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)';

      const makeThinBorder = (color: string = 'C0C0C0'): Partial<ExcelJS.Borders> => ({
        top: { style: 'thin' as ExcelJS.BorderStyle, color: { argb: color } },
        bottom: { style: 'thin' as ExcelJS.BorderStyle, color: { argb: color } },
        left: { style: 'thin' as ExcelJS.BorderStyle, color: { argb: color } },
        right: { style: 'thin' as ExcelJS.BorderStyle, color: { argb: color } },
      });
      
      // --------------------------
      // Compute Metrics for Sheet 1 (using inputPackages - today only)
      // --------------------------
      const pickupPackages = inputPackages;
      const pickupTotalCount = pickupPackages.length;
      const pickupTotalCOD = pickupPackages.reduce((acc, p) => acc + Number(p.codAmount || 0), 0);

      // --------------------------
      // Compute Metrics for Sheet 2 (using historicalPackages - all past data)
      // --------------------------
      const deliveryPackages = historicalPackages;
      const totalCount = deliveryPackages.length;
      const completed = deliveryPackages.filter(p => ['DELIVERED', 'RETURNED'].includes(p.status));
      const failed = deliveryPackages.filter(p => ['FAILED', 'PENDING', 'ON_DELIVERY'].includes(p.status));
      const delivered = deliveryPackages.filter((p) => p.status === 'DELIVERED');
      const pending = deliveryPackages.filter((p) => p.status !== 'DELIVERED');
      
      const sum = (arr: any[], key: string) =>
        arr.reduce((acc, p) => acc + Number(p[key] || 0), 0);

      const totalCOD = sum(deliveryPackages, 'codAmount');
      const collectedCOD = sum(delivered, 'codAmount');
      const uncollectedCOD = sum(pending, 'codAmount');
      const totalDeliveryFee = sum(delivered, 'deliveryFee');
      const outstanding = 0;
      const toSettle = collectedCOD - totalDeliveryFee;
      
      // --------------------------
      // SHEET 1: Pick up [DD-MMM-YY]
      // --------------------------
      const pickupSheet = workbook.addWorksheet(`Pick up ${formatDateShort(label)}`);
      pickupSheet.pageSetup = {
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        horizontalCentered: true,
        margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
      };

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

      const headerRow = pickupSheet.addRow(pickupHeaders);
      headerRow.eachCell((cell) => {
        applyStyle(cell, {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } },
          font: { color: { argb: 'FFFFFFFF' }, bold: true },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: makeThinBorder('FFFFFFFF'),
        });
      });
      
      pickupPackages.forEach((pkg, i) => {
        const row = pickupSheet.addRow([
          i+1,
          formatDateTime(pkg.createdAt),
          pkg.status === 'DELIVERED' && pkg.updatedAt ? formatDateTime(pkg.updatedAt) : '',
          pkg.customerName,
          pkg.customerAddress,
          pkg.customerPhone,
          pkg.packageNumber,
          Number(pkg.codAmount) || 0,
        ]);

        row.eachCell((cell, col) => applyStyle(cell, {
          fill: { type:'pattern', pattern:'solid', fgColor:{argb:getRowFillColor(i+2)} },
          font: { color:{argb:'FF000000'} },
          alignment: { horizontal: [4,5,8].includes(col)? 'left':'center', vertical:'middle' },
          border: makeThinBorder('FFDEE2E6'),
        }));
        
        row.getCell(8).numFmt = createCurrencyFormat;
      });

      const firstDataRow = 2;
      const lastDataRow = firstDataRow + pickupPackages.length - 1;

      // --- Totals ---
      const totalPackageRow = pickupSheet.addRow(['','','','','','','Total Package', { formula: `COUNTA(A${firstDataRow}:A${lastDataRow})`, result: pickupTotalCount }]);
      const totalAmountRow = pickupSheet.addRow(['','','','','','','Total Amount', { formula: `SUM(H${firstDataRow}:H${lastDataRow})`, result: pickupTotalCOD }]);
      [totalPackageRow,totalAmountRow].forEach((row, idx) => {
        row.eachCell((cell,col) => {
          if(col>=7) applyStyle(cell,{
            fill:{type:'pattern',pattern:'solid',fgColor:{argb:'FFFEF3C7'}},
            font:{color:{argb:'FF000000'},bold:true},
            alignment:{horizontal:(idx===0 && col===8)?'right':'center',vertical:'middle'},
            border: makeThinBorder('FFDEE2E6'),
          });
          if(idx===1 && col===8) cell.numFmt = createCurrencyFormat;
        });
      });

      pickupSheet.columns = [
        { width: 5 },  // ID
        { width: 21 }, // Shipment Create Date
        { width: 22 }, // Shipment Delivery Date
        { width: 18 }, // Receiver Name
        { width: 30 }, // Address
        { width: 16 }, // Contact
        { width: 22 }, // Tracking#
        { width: 23 }, // Cash Collection Amount
      ];
      pickupSheet.eachRow(row=>row.height=17);

      // --------------------------
      // SHEET 2: Delivery Report
      // --------------------------
      const deliverySheet = workbook.addWorksheet(`Delivery report ${formatDateShort(label)}`);
      deliverySheet.pageSetup = {
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        horizontalCentered: true,
        margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
      };

      let r = 1;
      const merchantData = [
        ['ឈ្មោះហាង ៖', merchant.name],
        ['ឈ្មោះធនាគារ ៖', merchant.bankAccountName || merchant.bank || ''],
        ['កាលបរិច្ឆេទរបាយការណ៍ ៖', label],
      ];
      merchantData.forEach(([label, val]) => {
        deliverySheet.mergeCells(r, 1, r, 2);
        deliverySheet.mergeCells(r, 3, r, 4); 
        deliverySheet.getCell(r, 1).value = label;
        deliverySheet.getCell(r, 3).value = val;
        ['1', '3'].forEach((c) => {
          const cell = deliverySheet.getCell(r, Number(c));
          if (c === '1') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '003366' }};
          cell.font = { color: { argb: c==='1'?'FFFFFFFF':'000000' }, bold: true };
          cell.alignment = { horizontal: c==='1'? 'left':'center', vertical: 'middle' };
          cell.border = makeThinBorder('000000');
        });
        r++;
      });
      r++;

      // --- Metrics Summary (simplified) ---
      const metricRow = (label: string, val: number | string, bg: string, valBg: string, colStart: number, colspan = 1, numFmt?: string) => {
        if (colspan > 1) {
          deliverySheet.mergeCells(r, colStart, r, colStart + colspan - 1);
          deliverySheet.mergeCells(r+1, colStart, r+1, colStart + colspan - 1);
        }
        const labelCell = deliverySheet.getCell(r, colStart);
        labelCell.value = label;
        labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        labelCell.font = { color: { argb: 'FFFFFFFF' } };

        // Value below
        const valueCell = deliverySheet.getCell(r + 1, colStart);
        valueCell.value = val;
        valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: valBg } };
        valueCell.font = { bold: true };
        valueCell.alignment = labelCell.alignment = { horizontal: 'center', vertical: 'middle' };
        valueCell.border = labelCell.border = makeThinBorder('000000');
        if (numFmt) valueCell.numFmt = numFmt;
      };
      
      metricRow('ចំនួនកញ្ចប់សរុប', totalCount, '1E40AF','C5D9F1', 1, 2);
      metricRow('បានបញ្ចប់', completed.length, 'FF047857', 'D8E4BC', 3);
      metricRow('មិនទាន់បញ្ចប់', failed.length, 'FFB45309', 'FCD5B4', 4);
      r += 3;

      metricRow('តម្លៃទំនិញទាំងអស់', totalCOD, 'FF1E3A8A', 'C5D9F1', 1, 2, createCurrencyFormat);
      metricRow('ទឹកប្រាក់ប្រមូលបានសរុប', collectedCOD, 'FF065F46', 'D8E4BC', 3, 2, createCurrencyFormat);
      metricRow('ទឹកប្រាក់មិនទាន់ប្រមូល', uncollectedCOD, 'FFB45309', 'FDE9D9', 5, 2, createCurrencyFormat);
      metricRow('ថ្លៃដឹកសរុប', totalDeliveryFee, 'FF1D4ED8', 'DAEEF3', 7, 2, createCurrencyFormat);
      metricRow('ទឹកប្រាក់ជំពាក់', outstanding, 'FF991B1B', 'F2DCDB', 9, 2, createCurrencyFormat);
      metricRow('ទឹកប្រាក់ត្រូវទូរទាត់', toSettle, 'FF2563EB', 'DCE6F1', 11, 1, createCurrencyFormat);
      deliverySheet.addRow([]);

      // --- Detail Table Header ---
      const detailHeaders = ['No', 'Create Date', 'Receiver', 'Address', 'Contact', 'Tracking#', 'Status', 'COD', 'Delivery Fee', 'Remark'];
      const detailHeadersRow = deliverySheet.addRow(detailHeaders);
      deliverySheet.mergeCells(detailHeadersRow.number, 10, detailHeadersRow.number, 11);
      detailHeadersRow.eachCell((cell) => {
        applyStyle(cell, {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } },
          font: { color: { argb: '000000' }, bold: true },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: makeThinBorder('FFDEE2E6'),
        });
      });

      // --- Data ---
      // Sheet 2 uses historicalPackages (all past data up to endDate)
      deliveryPackages.forEach((pkg, i) => {
        const row = deliverySheet.addRow([
          i + 1,
          formatDateTime(pkg.createdAt),
          pkg.customerName,
          pkg.customerAddress,
          pkg.customerPhone,
          pkg.packageNumber,
          pkg.status,
          Number(pkg.codAmount) || 0,
          Number(pkg.deliveryFee) || 0,
          '',
        ]);
        deliverySheet.mergeCells(row.number, 10, row.number, 11);

        let statusFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: getRowFillColor(i + 2) } } as ExcelJS.Fill;
        switch (pkg.status) {
          case 'ON_DELIVERY':
            statusFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCE6F1' } } as ExcelJS.Fill;
            break;
          case 'PENDING':
            statusFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FDE9D9' } } as ExcelJS.Fill;
            break;
          case 'RETURNED':
            statusFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EBF1DE' } } as ExcelJS.Fill;
            break;
          case 'FAILED':
            statusFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2DCDB' } } as ExcelJS.Fill;
            break;
          default:
            break;
        }

        row.eachCell((cell,col) => {
          if (col >= 7 && col <= 11) {
            cell.fill = statusFill;
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: getRowFillColor(i + 2) } };
          }
          cell.border = makeThinBorder('FFDEE2E6');
          cell.alignment = { horizontal: [1,2,5,6,7].includes(col)? 'center':'left', vertical:'middle' };
          if ([8, 9].includes(col)) {
            cell.numFmt = createCurrencyFormat;
            if (pkg.status !== 'DELIVERED') cell.font = { ...cell.font, strike: true}
          }
        });
      });
      
      // --- Totals Section ---
      const totalsData = [
        ['Total Cash', collectedCOD, totalDeliveryFee],
        // ['Total Expenses Entry', 0, ''],
        ['Total Expenses', totalDeliveryFee, ''],
        ['Total Outstanding Balance', outstanding, ''],
        ['Deduct Fee After Expenses', toSettle, ''],
      ];
      r = deliverySheet.rowCount + 1;
      totalsData.forEach(([label, val, val2], index) => {
        const isLastRow = index === totalsData.length - 1;

        deliverySheet.mergeCells(r, 4, r, 7);
        deliverySheet.mergeCells(r, 10, r, 11); 
        deliverySheet.getCell(r, 4).value = label;
        deliverySheet.getCell(r, 8).value = val;
        deliverySheet.getCell(r, 9).value = val2;
        deliverySheet.getCell(r, 8).numFmt = createCurrencyFormat;
        deliverySheet.getCell(r, 9).numFmt = createCurrencyFormat;
        ['4', '8', '9', '10'].forEach((c) => {
          const cell = deliverySheet.getCell(r, Number(c));

          if (isLastRow) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B7DEEA' }};
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEFF00' }};
          }
          
          cell.font = { bold: true };
          cell.alignment = { horizontal: c==='4'? 'right':'left', vertical: 'middle' };
          cell.border = makeThinBorder('C0C0C0');
        });
        r++;
      });
      
      r++;
      // OUTSTANDING DETAIL (orange/yellow bg, then white rows)
      deliverySheet.mergeCells(r, 1, r, 3);
      const titleCell = deliverySheet.getCell(r, 1);
      titleCell.value = 'Outstanding Detail';
      applyStyle(titleCell, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFED7AA' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: makeThinBorder('C0C0C0'),
      });

      const outstandingHeaders = [ 'Outstanding Date','', 'Outstanding Balance'];
      const outstandingRow = deliverySheet.addRow(outstandingHeaders);
      deliverySheet.mergeCells(outstandingRow.number, 1, outstandingRow.number, 2);

      outstandingRow.eachCell((cell) => {
        applyStyle(cell, {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } },
          font: { color: { argb: '000000' } },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: makeThinBorder('C0C0C0'),
        });
      });
      r = outstandingRow.number + 1;
      deliverySheet.mergeCells(r, 1, r, 2);
      const totalLabel = deliverySheet.getCell(r, 1);
      const totalValue = deliverySheet.getCell(r, 3);

      totalLabel.value = 'Total';
      applyStyle(totalLabel, {
        alignment: { horizontal: 'right', vertical: 'middle' },
        font: { bold: true },
        border: makeThinBorder('C0C0C0'),
      });

      totalValue.value = 0;
      applyStyle(totalValue, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEFF00' } },
        alignment: { horizontal: 'left', vertical: 'middle' },
        font: { bold: true },
        numFmt: createCurrencyFormat,
        border: makeThinBorder('C0C0C0'),
      });

      // Set column widths for delivery sheet
      deliverySheet.columns = [
        { width: 5 }, // No
        { width: 18 }, // Shipment Create Date
        { width: 20 }, // Receiver Name
        { width: 24 }, // Address
        { width: 12 }, // Contact
        { width: 22 }, // Tracking#
        { width: 20 }, // Status
        { width: 14 }, // COD
        { width: 14 }, // Delivery Fee
        { width: 4 }, // Remark
        { width: 21 }, // Empty
      ];
      deliverySheet.eachRow(row=>row.height=18);

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
