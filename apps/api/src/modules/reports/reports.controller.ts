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

      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Minimal headers as requested
      const headers = [
        'ID',
        'Shipment Create Date',
        'Shipment Delivery Date',
        'Receiver Name',
        'Address',
        'Contact',
        'Tracking#',
        'Cash Collection Amount',
      ];

      const dataRows = reports.data.map(
        (item: DriverReportDto | MerchantReportDto, index: number) => {
          const deliveryDate = item.shipmentDeliveryDate
            ? formatDateTime(item.shipmentDeliveryDate)
            : 'Not Delivered';

          return [
            index + 1,
            formatDateTime(item.shipmentCreateDate),
            deliveryDate,
            item.receiverName,
            item.address,
            item.contact,
            item.trackingNumber,
            item.cashCollectionAmount,
          ];
        },
      );

      // Create worksheet just with the table (no top summary)
      const allData = [headers, ...dataRows];
      const worksheet = XLSX.utils.aoa_to_sheet(allData);

      // Set column widths
      const columnWidths = [
        { wch: 5 }, // ID
        { wch: 20 }, // Shipment Create Date
        { wch: 20 }, // Shipment Delivery Date
        { wch: 18 }, // Receiver Name
        { wch: 30 }, // Address
        { wch: 16 }, // Contact
        { wch: 22 }, // Tracking#
        { wch: 20 }, // Cash Collection Amount
      ];
      worksheet['!cols'] = columnWidths;

      // Add styling and totals similar to screenshot
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      const range = XLSX.utils.decode_range((worksheet as any)['!ref'] || 'A1');

      // Style column headers
      const headerRow = 1; // first row
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
      for (let row = headerRow + 1; row <= range.e.r; row++) {
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

      // Add totals at the bottom like the screenshot (in G/H columns)
      const totalsRowStart = range.e.r + 2; // one blank row after data
      const totalPackageCellLabel = `G${totalsRowStart}`;
      const totalPackageCellValue = `H${totalsRowStart}`;
      const totalAmountCellLabel = `G${totalsRowStart + 1}`;
      const totalAmountCellValue = `H${totalsRowStart + 1}`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (worksheet as any)[totalPackageCellLabel] = { v: 'Total Package' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (worksheet as any)[totalPackageCellValue] = {
        v: reports.analytics.totalPackages,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (worksheet as any)[totalAmountCellLabel] = { v: 'Total Amount' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (worksheet as any)[totalAmountCellValue] = {
        v: Number(reports.analytics.totalCOD.toFixed(2)),
      };

      // Apply styles (yellow background)
      const totalsCells = [
        totalPackageCellLabel,
        totalPackageCellValue,
        totalAmountCellLabel,
        totalAmountCellValue,
      ];
      for (const ref of totalsCells) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        (worksheet[ref] as any).s = {
          fill: { fgColor: { rgb: 'FFF59D' } },
          font: { bold: true },
          border: {
            top: { style: 'thin', color: { rgb: 'BDBDBD' } },
            bottom: { style: 'thin', color: { rgb: 'BDBDBD' } },
            left: { style: 'thin', color: { rgb: 'BDBDBD' } },
            right: { style: 'thin', color: { rgb: 'BDBDBD' } },
          },
        };
      }

      // Ensure totals are inside the worksheet range/ref so they appear in the file
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (worksheet as any)['!ref'] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: totalsRowStart + 1, c: headers.length - 1 },
      });

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
