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
import * as XLSX from 'xlsx';

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
  @Header('Content-Disposition', 'attachment; filename="delivery_report.xlsx"')
  async exportToExcel(
    @Query(new ValidationPipe({ transform: true })) query: ReportsQueryDto,
    @Res() res: Response,
  ) {
    try {
      const reports = await this.reportsService.getReports(query);

      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Create summary data
      const summaryData = [
        ['DYHE DELIVERY REPORT'],
        [
          `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        ],
        [''],
        ['SUMMARY STATISTICS:'],
        ['Metric', 'Value'],
        ['Total Package', reports.analytics.totalPackages],
        ['Total Amount', `$${reports.analytics.totalCOD.toFixed(2)}`],
        ['Delivered Packages', reports.analytics.deliveredPackages],
        ['Pending Packages', reports.analytics.pendingPackages],
        ['Cancelled Packages', reports.analytics.cancelledPackages],
        ['Returned Packages', reports.analytics.returnedPackages],
        [''],
        ['DETAILED PACKAGE LIST:'],
        [''],
      ];

      // Create main data
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

      const dataRows = reports.data.map(
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
            item.receiverName,
            item.address,
            item.contact,
            item.trackingNumber,
            item.cashCollectionAmount,
            item.driverName || 'Not Assigned',
            item.merchantName,
            item.status,
          ];
        },
      );

      // Combine all data
      const allData = [...summaryData, headers, ...dataRows];

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(allData);

      // Set column widths
      const columnWidths = [
        { wch: 5 }, // ID
        { wch: 20 }, // Shipment Create Date
        { wch: 20 }, // Shipment Delivery Date
        { wch: 15 }, // Receiver Name
        { wch: 25 }, // Address
        { wch: 15 }, // Contact
        { wch: 15 }, // Tracking#
        { wch: 18 }, // Cash Collection Amount
        { wch: 15 }, // Driver
        { wch: 15 }, // Merchant
        { wch: 12 }, // Status
      ];
      worksheet['!cols'] = columnWidths;

      // Add styling and colors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const range = XLSX.utils.decode_range((worksheet as any)['!ref'] || 'A1');

      // Style the header row (DYHE DELIVERY REPORT)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (worksheet['A1'] as any).s = {
        font: { bold: true, size: 16, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '2E86AB' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };

      // Merge cells for title
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (worksheet as any)['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
      ];

      // Style the generation date
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (worksheet['A2'] as any).s = {
        font: { italic: true, size: 10 },
        fill: { fgColor: { rgb: 'F8F9FA' } },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      (worksheet as any)['!merges'].push({
        s: { r: 1, c: 0 },
        e: { r: 1, c: 10 },
      });

      // Style the summary section
      const summaryStartRow = 4;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (worksheet[`A${summaryStartRow}`] as any).s = {
        font: { bold: true, size: 12, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '28A745' } },
      };

      // Style summary headers (Metric, Value)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (worksheet[`A${summaryStartRow + 1}`] as any).s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E9ECEF' } },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (worksheet[`B${summaryStartRow + 1}`] as any).s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E9ECEF' } },
      };

      // Style summary values
      for (let i = 0; i < 5; i++) {
        const row = summaryStartRow + 2 + i;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        (worksheet[`A${row}`] as any).s = {
          fill: { fgColor: { rgb: 'F8F9FA' } },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        (worksheet[`B${row}`] as any).s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'F8F9FA' } },
        };
      }

      // Style the detailed list header
      const dataStartRow = summaryStartRow + 8;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (worksheet[`A${dataStartRow}`] as any).s = {
        font: { bold: true, size: 12, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '6C757D' } },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      (worksheet as any)['!merges'].push({
        s: { r: dataStartRow - 1, c: 0 },
        e: { r: dataStartRow - 1, c: 10 },
      });

      // Style column headers
      const headerRow = dataStartRow + 2;
      for (let col = 0; col < headers.length; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: headerRow - 1, c: col });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        (worksheet[cellRef] as any).s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '495057' } },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }

      // Style data rows with alternating colors
      for (let row = headerRow; row <= range.e.r; row++) {
        const isEvenRow = (row - headerRow) % 2 === 0;
        const fillColor = isEvenRow ? 'FFFFFF' : 'F8F9FA';

        for (let col = 0; col <= range.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellRef]) continue;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
          (worksheet[cellRef] as any).s = {
            fill: { fgColor: { rgb: fillColor } },
            border: {
              top: { style: 'thin', color: { rgb: 'DEE2E6' } },
              bottom: { style: 'thin', color: { rgb: 'DEE2E6' } },
              left: { style: 'thin', color: { rgb: 'DEE2E6' } },
              right: { style: 'thin', color: { rgb: 'DEE2E6' } },
            },
          };
        }
      }

      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Delivery Report');

      // Generate Excel file buffer
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const excelBuffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      });

      res.send(excelBuffer);
    } catch (error) {
      console.error('Excel Export Error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to export Excel: ${errorMessage}`);
    }
  }
}
