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
import * as XLSX from 'xlsx';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('debug')
  async debug(@Query() query: any) {
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
      throw new BadRequestException(`Failed to get reports: ${error.message}`);
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
      ...reports.data.map((item: any, index: number) => {
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
      }),
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

      const dataRows = reports.data.map((item: any, index: number) => {
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
      });

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

      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Delivery Report');

      // Generate Excel file buffer
      const excelBuffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      });

      res.send(excelBuffer);
    } catch (error) {
      console.error('Excel Export Error:', error);
      throw new BadRequestException(`Failed to export Excel: ${error.message}`);
    }
  }
}
