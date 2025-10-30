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

  @Get('export/excel')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="DeliveryReport.xlsx"')
  async exportToExcel(
    @Query(new ValidationPipe({ transform: true })) query: ReportsQueryDto,
    @Res() res: Response,
  ) {
    try {
      const reports = await this.reportsService.getReports(query);

      // Helper to format date like 22-06-25 12:06 PM
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

      // Helper to format date like DD-MMM-YY
      const formatDateShort = (isoDate?: string | Date) => {
        if (!isoDate) return '';
        const d = new Date(isoDate);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const yy = String(d.getFullYear()).slice(-2);
        const mm = months[d.getMonth()];
        const dd = String(d.getDate()).padStart(2, '0');
        return `${dd}-${mm}-${yy}`;
      };

      // Helper to format date like MM/DD/YYYY
      const formatDateUS = (isoDate?: string | Date) => {
        if (!isoDate) return '';
        const d = new Date(isoDate);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
      };

      // Create ExcelJS workbook
      const workbook = new ExcelJS.Workbook();
      const today = new Date();
      const todayStr = formatDateShort(today);

      // === SHEET 1: Pick up [DD-MMM-YY] ===
      const pickupSheetName = `Pick up ${todayStr}`;
      const pickupSheet = workbook.addWorksheet(pickupSheetName);

      // Headers for pickup sheet
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

      // Add headers with styling
      const headerRow = pickupSheet.addRow(pickupHeaders);
      headerRow.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1E3A8A' } // Dark blue
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // White
          bold: true
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
          bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
          left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
          right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
        };
      });

      // Add data rows with alternating colors
      reports.data.forEach((item: DriverReportDto | MerchantReportDto, index: number) => {
        const deliveryDate = item.shipmentDeliveryDate
          ? formatDateTime(item.shipmentDeliveryDate)
          : '';

        const dataRow = pickupSheet.addRow([
          index + 1,
          formatDateTime(item.shipmentCreateDate),
          deliveryDate,
          `"${item.receiverName}"`,
          `"${item.address}"`,
          `"${item.contact}"`,
          `"${item.trackingNumber}"`,
          item.cashCollectionAmount > 0
            ? `$${item.cashCollectionAmount.toFixed(2)}`
            : '$0.00',
        ]);

        const isEvenRow = (index + 2) % 2 === 0; // +2 because header is row 1
        const fillColor = isEvenRow ? 'FFFFFFFF' : 'FFF8F9FA'; // White or light gray

        dataRow.eachCell((cell, colNumber) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: fillColor }
          };
          cell.font = {
            color: { argb: 'FF000000' } // Black
          };
          cell.alignment = {
            horizontal: 'left',
            vertical: 'middle'
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFDEE2E6' } },
            bottom: { style: 'thin', color: { argb: 'FFDEE2E6' } },
            left: { style: 'thin', color: { argb: 'FFDEE2E6' } },
            right: { style: 'thin', color: { argb: 'FFDEE2E6' } }
          };
        });
      });

      // Add totals rows
      const totalPackageRow = pickupSheet.addRow(['', '', '', '', '', '', 'Total Package', reports.analytics.totalPackages]);
      const totalAmountRow = pickupSheet.addRow(['', '', '', '', '', '', 'Total Amount', Number(reports.analytics.totalCOD.toFixed(2))]);

      // Style totals rows with yellow background
      [totalPackageRow, totalAmountRow].forEach(row => {
        row.eachCell((cell, colNumber) => {
          if (colNumber >= 7) { // Only style columns G and H
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEF3C7' } // Yellow
            };
            cell.font = {
              color: { argb: 'FF000000' }, // Black
              bold: true
            };
            cell.alignment = {
              horizontal: 'center',
              vertical: 'middle'
            };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFBDBDBD' } },
              bottom: { style: 'thin', color: { argb: 'FFBDBDBD' } },
              left: { style: 'thin', color: { argb: 'FFBDBDBD' } },
              right: { style: 'thin', color: { argb: 'FFBDBDBD' } }
            };
          }
        });
      });

      // Set column widths
      pickupSheet.columns = [
        { width: 5 }, // ID
        { width: 20 }, // Shipment Create Date
        { width: 20 }, // Shipment Delivery Date
        { width: 18 }, // Receiver Name
        { width: 30 }, // Address
        { width: 16 }, // Contact
        { width: 22 }, // Tracking#
        { width: 20 }, // Cash Collection Amount
      ];

      // === SHEET 2: Delivery report [DD-MMM-YY] ===
      const deliverySheetName = `Delivery report ${todayStr}`;
      const deliverySheet = workbook.addWorksheet(deliverySheetName);

      // Helper function to style cells
      const styleCell = (row: number, col: number, style: any) => {
        const cell = deliverySheet.getCell(row, col);
        if (style.fill) cell.fill = style.fill;
        if (style.font) cell.font = style.font;
        if (style.alignment) cell.alignment = style.alignment;
        if (style.border) cell.border = style.border;
      };

      // Row 1: Shop name
      deliverySheet.getCell(1, 1).value = 'ឈ្មោះហាង ៖';
      deliverySheet.getCell(1, 3).value = 'Pink Please';
      styleCell(1, 1, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } },
        font: { color: { argb: 'FFFFFFFF' }, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' }
      });
      styleCell(1, 3, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' }
      });

      // Row 2: Bank info
      deliverySheet.getCell(2, 1).value = 'ឈ្មោះធនាគារ ៖';
      deliverySheet.getCell(2, 3).value = '099 888 852 sarychanminea';
      styleCell(2, 1, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } },
        font: { color: { argb: 'FFFFFFFF' }, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' }
      });
      styleCell(2, 3, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' }
      });

      // Row 3: Report date
      deliverySheet.getCell(3, 1).value = 'កាលបរិច្ឆេទរបាយការណ៍ ៖';
      deliverySheet.getCell(3, 3).value = formatDateUS(today);
      styleCell(3, 1, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } },
        font: { color: { argb: 'FFFFFFFF' }, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' }
      });
      styleCell(3, 3, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' }
      });

      // Row 6: Package status summary headers
      deliverySheet.getCell(6, 1).value = 'ចំនួនកញ្ចប់សរុប';
      deliverySheet.getCell(6, 3).value = 'បានបញ្ចប់';
      deliverySheet.getCell(6, 4).value = 'មិនទាន់បញ្ចប់';
      styleCell(6, 1, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } },
        font: { color: { argb: 'FFFFFFFF' }, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      });
      styleCell(6, 3, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF166534' } },
        font: { color: { argb: 'FFFFFFFF' }, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      });
      styleCell(6, 4, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } },
        font: { color: { argb: 'FFFFFFFF' }, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      });

      // Row 7: Package status values
      deliverySheet.getCell(7, 1).value = reports.analytics.totalPackages;
      deliverySheet.getCell(7, 3).value = reports.analytics.totalPackages - 1;
      deliverySheet.getCell(7, 4).value = 1;
      styleCell(7, 1, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      });
      styleCell(7, 3, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      });
      styleCell(7, 4, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      });

      // Row 10: Financial summary headers
      const financialHeaders = [
        'តម្លៃទំនិញទាំងអស់',
        'ទឹកប្រាក់ប្រមូលបានសរុប',
        'ទឹកប្រាក់ដែរត្រូវទូរទាត់',
        'ថ្លៃដឹកជញ្ជូន',
        'ថ្លៃដឹកជញ្ជូនដែរត្រូវទូរទាត់',
        'ទឹកប្រាក់ដែរត្រូវទូរទាត់'
      ];
      financialHeaders.forEach((header, index) => {
        deliverySheet.getCell(10, index + 1).value = header;
        const colors = ['FF86EFAC', 'FF86EFAC', 'FF86EFAC', 'FFFED7AA', 'FFFED7AA', 'FF7C2D12'];
        styleCell(10, index + 1, {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colors[index] } },
          font: { color: { argb: index === 5 ? 'FFFFFFFF' : 'FF000000' }, bold: true },
          alignment: { horizontal: 'center', vertical: 'middle' }
        });
      });

      // Row 11: Financial summary values
      const financialValues = [
        `$${Number(reports.analytics.totalCOD.toFixed(2)) + 20}`,
        `$${Number(reports.analytics.totalCOD.toFixed(2))}`,
        '$20',
        '$15',
        '$0',
        `$${Number(reports.analytics.totalCOD.toFixed(2)) - 15}`
      ];
      financialValues.forEach((value, index) => {
        deliverySheet.getCell(11, index + 1).value = value;
        styleCell(11, index + 1, {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
          font: { color: { argb: 'FF000000' }, bold: true },
          alignment: { horizontal: 'center', vertical: 'middle' }
        });
      });

      // Row 14: Detailed headers
      const detailHeaders = [
        'No', 'Shipment Create Date', 'Receiver Name', 'Address', 'Contact', 
        'Tracking#', 'Status', 'COD', 'Pick Fee', 'Taxi Fee', 'Delivery Fee', 
        'Packaging Fee', 'Remark', ''
      ];
      detailHeaders.forEach((header, index) => {
        deliverySheet.getCell(14, index + 1).value = header;
        styleCell(14, index + 1, {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } },
          font: { color: { argb: 'FF000000' }, bold: true },
          alignment: { horizontal: 'center', vertical: 'middle' }
        });
      });

      // Data rows (15+): Add package data
      reports.data.forEach((item: DriverReportDto | MerchantReportDto, index: number) => {
        const rowNum = 15 + index;
        const rowData = [
          index + 1,
          formatDateTime(item.shipmentCreateDate),
          item.receiverName,
          item.address,
          item.contact,
          item.trackingNumber,
          item.shipmentDeliveryDate ? 'Delivered' : 'In Central Warehouse',
          item.cashCollectionAmount || '',
          '$0',
          '$0',
          '$15',
          '$0',
          '',
          ''
        ];
        
        rowData.forEach((value, colIndex) => {
          deliverySheet.getCell(rowNum, colIndex + 1).value = value;
          styleCell(rowNum, colIndex + 1, {
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
            font: { color: { argb: 'FF000000' } },
            alignment: { horizontal: 'left', vertical: 'middle' }
          });
        });
      });

      // Bottom summary rows
      const summaryRow = 15 + reports.data.length;
      
      // Total Cash
      deliverySheet.getCell(summaryRow, 3).value = 'Total Cash';
      deliverySheet.getCell(summaryRow, 7).value = `$${Number(reports.analytics.totalCOD.toFixed(2))}`;
      styleCell(summaryRow, 3, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' }
      });
      styleCell(summaryRow, 7, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      });

      // Total Expenses Entry
      deliverySheet.getCell(summaryRow + 2, 3).value = 'Total Expenses Entry';
      deliverySheet.getCell(summaryRow + 2, 7).value = '$15';
      styleCell(summaryRow + 2, 3, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' }
      });
      styleCell(summaryRow + 2, 7, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      });

      // Total Expenses
      deliverySheet.getCell(summaryRow + 3, 3).value = 'Total Expenses';
      deliverySheet.getCell(summaryRow + 3, 4).value = '$15';
      styleCell(summaryRow + 3, 3, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' }
      });
      styleCell(summaryRow + 3, 4, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      });

      // Deduct Fee After Expenses
      deliverySheet.getCell(summaryRow + 4, 3).value = 'Deduct Fee After Expenses';
      deliverySheet.getCell(summaryRow + 4, 4).value = `$${Number(reports.analytics.totalCOD.toFixed(2)) - 15}`;
      styleCell(summaryRow + 4, 3, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' }
      });
      styleCell(summaryRow + 4, 4, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      });

      // Outstanding Detail section
      const outstandingRow = summaryRow + 7;
      deliverySheet.getCell(outstandingRow, 1).value = 'Outstanding Detail';
      styleCell(outstandingRow, 1, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFED7AA' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' }
      });

      deliverySheet.getCell(outstandingRow + 1, 1).value = 'Outstanding Date';
      deliverySheet.getCell(outstandingRow + 1, 2).value = 'Outstanding Balance';
      styleCell(outstandingRow + 1, 1, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' }
      });
      styleCell(outstandingRow + 1, 2, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' }
      });

      deliverySheet.getCell(outstandingRow + 2, 1).value = 'Total';
      deliverySheet.getCell(outstandingRow + 2, 2).value = '$0';
      styleCell(outstandingRow + 2, 1, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' }
      });
      styleCell(outstandingRow + 2, 2, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        font: { color: { argb: 'FF000000' }, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      });

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

      // Generate Excel buffer
      const buffer = await workbook.xlsx.writeBuffer();
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="DeliveryReport.xlsx"');
      res.send(buffer);
    } catch (error) {
      console.error('Excel Export Error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to export Excel: ${errorMessage}`);
    }
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
        if (!statusMap[pkg.status]) {
          statusMap[pkg.status] = { count: 0, amount: 0 };
        }
        statusMap[pkg.status].count += 1;
        statusMap[pkg.status].amount += cash;
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
        deliverySheet.getCell(rowPtr, 7).value = isDelivered ? 'Delivered' : 'In Central Warehouse';
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
