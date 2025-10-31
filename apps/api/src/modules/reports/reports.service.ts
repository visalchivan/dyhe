import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportsQueryDto, ReportType } from './dto/reports-query.dto';
import {
  ReportsResponseDto,
  DriverReportDto,
  MerchantReportDto,
  PackageAnalyticsDto,
} from './dto/reports-response.dto';
import { PackageStatus } from '../../../generated/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getReports(query: ReportsQueryDto): Promise<ReportsResponseDto> {
    console.log(
      'Reports Service - Received query:',
      JSON.stringify(query, null, 2),
    );

    const {
      driverId,
      merchantId,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 1000,
      type = ReportType.PACKAGE,
    } = query;

    // Build where clause for filtering
    const where: Record<string, any> = {};

    if (driverId) {
      where.driverId = driverId;
    }

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        // Set to beginning of day in Asia/Phnom_Penh timezone
        const start = new Date(`${startDate}T00:00:00+07:00`);
        where.createdAt.gte = start;
      }
      if (endDate) {
        // Set to end of day in Asia/Phnom_Penh timezone
        const end = new Date(`${endDate}T23:59:59.999+07:00`);
        where.createdAt.lte = end;
      }
    }

    if (search) {
      where.OR = [
        { packageNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { customerAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get packages with relations
    const packages = await this.prisma.package.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
          },
        },
        merchant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get total count for pagination
    const total = await this.prisma.package.count({ where });

    // Transform data based on report type
    let data: (DriverReportDto | MerchantReportDto)[];

    if (type === ReportType.DRIVER || type === ReportType.DRIVERS) {
      data = packages.map(
        (pkg): DriverReportDto => ({
          id: pkg.id,
          packageNumber: pkg.packageNumber,
          shipmentCreateDate: pkg.createdAt,
          shipmentDeliveryDate:
            pkg.status === PackageStatus.DELIVERED ? pkg.updatedAt : undefined,
          receiverName: pkg.customerName,
          address: pkg.customerAddress,
          contact: pkg.customerPhone,
          trackingNumber: pkg.packageNumber,
          cashCollectionAmount: Number(pkg.codAmount),
          driverName: pkg.driver?.name,
          merchantName: pkg.merchant.name,
          status: pkg.status,
        }),
      );
    } else if (type === ReportType.MERCHANT || type === ReportType.MERCHANTS) {
      data = packages.map(
        (pkg): MerchantReportDto => ({
          id: pkg.id,
          packageNumber: pkg.packageNumber,
          shipmentCreateDate: pkg.createdAt,
          shipmentDeliveryDate:
            pkg.status === PackageStatus.DELIVERED ? pkg.updatedAt : undefined,
          receiverName: pkg.customerName,
          address: pkg.customerAddress,
          contact: pkg.customerPhone,
          trackingNumber: pkg.packageNumber,
          cashCollectionAmount: Number(pkg.codAmount),
          deliveryFee: Number(pkg.deliveryFee || 0) + Number(pkg.extraDeliveryFee || 0),
          driverName: pkg.driver?.name,
          merchantName: pkg.merchant.name,
          status: pkg.status,
        }),
      );
    } else {
      // Default to driver report format
      data = packages.map(
        (pkg): DriverReportDto => ({
          id: pkg.id,
          packageNumber: pkg.packageNumber,
          shipmentCreateDate: pkg.createdAt,
          shipmentDeliveryDate:
            pkg.status === PackageStatus.DELIVERED ? pkg.updatedAt : undefined,
          receiverName: pkg.customerName,
          address: pkg.customerAddress,
          contact: pkg.customerPhone,
          trackingNumber: pkg.packageNumber,
          cashCollectionAmount: Number(pkg.codAmount),
          driverName: pkg.driver?.name,
          merchantName: pkg.merchant.name,
          status: pkg.status,
        }),
      );
    }

    // Calculate analytics
    const analytics = await this.calculateAnalytics(where);

    return {
      data,
      analytics,
      total,
      page,
      limit,
    };
  }

  async getDriverReports(query: ReportsQueryDto): Promise<ReportsResponseDto> {
    return this.getReports({ ...query, type: ReportType.DRIVER });
  }

  async getMerchantReports(query: ReportsQueryDto): Promise<ReportsResponseDto> {
    return this.getReports({ ...query, type: ReportType.MERCHANT });
  }

  // Compute start and end of day for Asia/Phnom_Penh (UTC+07:00)
  private getPhnomPenhDayRange(dateStr?: string): { start: Date; end: Date; label: string } {
    const toYmd = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    let ymd: string;
    if (dateStr) {
      ymd = dateStr;
    } else {
      const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Phnom_Penh', year: 'numeric', month: '2-digit', day: '2-digit' });
      // en-CA yields YYYY-MM-DD
      ymd = fmt.format(new Date());
    }

    // Build ISO with fixed +07:00 offset
    const start = new Date(`${ymd}T00:00:00+07:00`);
    const end = new Date(`${ymd}T23:59:59.999+07:00`);
    return { start, end, label: ymd };
  }

  // Compute date range for Asia/Phnom_Penh (UTC+07:00)
  // Note: Dates in database are stored as UTC, so we need to convert Phnom Penh times to UTC for proper comparison
  private getPhnomPenhDateRange(startDateStr?: string, endDateStr?: string): { start: Date; end: Date; endDateLabel: string } {
    const toYmd = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    let endYmd: string;
    if (endDateStr) {
      endYmd = endDateStr;
    } else {
      const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Phnom_Penh', year: 'numeric', month: '2-digit', day: '2-digit' });
      endYmd = fmt.format(new Date());
    }

    // Build end date range (for Sheet 1 - single day)
    // Create date in Phnom Penh timezone, then get UTC equivalent for database comparison
    const endDayStartPhnom = new Date(`${endYmd}T00:00:00+07:00`);
    const endDayEndPhnom = new Date(`${endYmd}T23:59:59.999+07:00`);
    // These Date objects already represent the correct UTC moment, Prisma will use them correctly

    // Build start date range (for Sheet 2 - from startDate to endDate)
    let rangeStart: Date;
    if (startDateStr) {
      rangeStart = new Date(`${startDateStr}T00:00:00+07:00`);
    } else {
      // If no startDate, use a very early date to include all past data
      // Use a date that's definitely before any package creation (1900-01-01 in UTC)
      rangeStart = new Date('1900-01-01T00:00:00Z');
    }

    return { 
      start: rangeStart, 
      end: endDayEndPhnom, 
      endDateLabel: endYmd 
    };
  }

  async buildMerchantWorkbook(merchantId: string, startDateStr?: string, endDateStr?: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    const { start: rangeStart, end: endDayEnd, endDateLabel } = this.getPhnomPenhDateRange(startDateStr, endDateStr);
    
    // Build end date single day range for Sheet 1 (00:00:00 to 23:59:59 on endDate)
    const endDayStartPhnom = new Date(`${endDateLabel}T00:00:00+07:00`);

    // Debug logging
    console.log('📊 buildMerchantWorkbook - Date ranges:', {
      merchantId,
      startDateStr: startDateStr || '(none - using all past data)',
      endDateStr: endDateStr || '(none - using current date)',
      endDateLabel,
      scenario: startDateStr && endDateStr ? 'SCENARIO 2: Date range selected' : 'SCENARIO 1: No date selected',
      rangeStart: rangeStart.toISOString(),
      endDayStartPhnom: endDayStartPhnom.toISOString(),
      endDayEnd: endDayEnd.toISOString(),
      sheet1Range: `endDate only: ${endDayStartPhnom.toISOString()} to ${endDayEnd.toISOString()}`,
      sheet2Range: startDateStr ? `startDate to endDate: ${rangeStart.toISOString()} to ${endDayEnd.toISOString()}` : `all past data: ${rangeStart.toISOString()} to ${endDayEnd.toISOString()}`,
    });

    // Sheet 1: packages created on endDate only (that single day)
    const inputPackages = await this.prisma.package.findMany({
      where: {
        merchantId,
        createdAt: { gte: endDayStartPhnom, lte: endDayEnd },
      },
      include: {
        driver: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Sheet 2: packages from startDate to endDate (inclusive range)
    // If no startDate provided, rangeStart will be a very early date (1900-01-01) to include all past data
    const historicalPackages = await this.prisma.package.findMany({
      where: {
        merchantId,
        createdAt: { gte: rangeStart, lte: endDayEnd },
      },
      include: {
        driver: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get all unique dates from Sheet 2 to verify we're getting past data
    const sheet2Dates = historicalPackages.map(p => {
      const date = new Date(p.createdAt);
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toISOString().split('T')[1].split('.')[0];
      return `${dateStr} ${timeStr}`;
    });
    const uniqueDates = [...new Set(sheet2Dates.map(d => d.split(' ')[0]))];

    console.log('📊 buildMerchantWorkbook - Results:', {
      sheet1Count: inputPackages.length,
      sheet2Count: historicalPackages.length,
      sheet2UniqueDates: uniqueDates.sort(),
      sheet2AllDates: sheet2Dates.slice(0, 10), // Show first 10
      sheet2OldestDate: sheet2Dates[sheet2Dates.length - 1],
      sheet2NewestDate: sheet2Dates[0],
    });

    // Build workbook using exceljs (imported by controller), return data model
    return {
      merchant,
      label: endDateLabel,
      inputPackages,
      historicalPackages,
    };
  }

  private async calculateAnalytics(
    where: Record<string, any>,
  ): Promise<PackageAnalyticsDto> {
    // Get all packages for analytics (without pagination)
    const allPackages = await this.prisma.package.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
          },
        },
        merchant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalPackages = allPackages.length;
    const totalCOD = allPackages.reduce(
      (sum, pkg) => sum + Number(pkg.codAmount),
      0,
    );
    const totalDeliveryFee = allPackages.reduce(
      (sum, pkg) => sum + Number(pkg.deliveryFee || 0) + Number(pkg.extraDeliveryFee || 0),
      0,
    );

    const deliveredPackages = allPackages.filter(
      (pkg) => pkg.status === PackageStatus.DELIVERED,
    ).length;
    const pendingPackages = allPackages.filter((pkg) =>
      [
        PackageStatus.PENDING,
        PackageStatus.ON_DELIVERY,
      ].includes(pkg.status as any),
    ).length;
    const failedPackages = allPackages.filter(
      (pkg) => pkg.status === PackageStatus.FAILED,
    ).length;
    const returnedPackages = allPackages.filter(
      (pkg) => pkg.status === PackageStatus.RETURNED,
    ).length;

    // Calculate average delivery time for delivered packages
    let averageDeliveryTime: number | undefined;
    const deliveredPkgs = allPackages.filter(
      (pkg) => pkg.status === PackageStatus.DELIVERED,
    );
    if (deliveredPkgs.length > 0) {
      const totalDeliveryTime = deliveredPkgs.reduce((sum, pkg) => {
        const deliveryTime = pkg.updatedAt.getTime() - pkg.createdAt.getTime();
        return sum + deliveryTime;
      }, 0);
      averageDeliveryTime =
        totalDeliveryTime / deliveredPkgs.length / (1000 * 60 * 60); // Convert to hours
    }

    return {
      totalPackages,
      totalCOD,
      totalDeliveryFee,
      deliveredPackages,
      pendingPackages,
      failedPackages,
      cancelledPackages: 0, // Not used in new flow
      returnedPackages,
      averageDeliveryTime,
    };
  }

  async getDriverPerformance(
    driverId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Record<string, any> = {};

    if (driverId) {
      where.driverId = driverId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        // Set to beginning of day in Asia/Phnom_Penh timezone
        const start = new Date(`${startDate}T00:00:00+07:00`);
        where.createdAt.gte = start;
      }
      if (endDate) {
        // Set to end of day in Asia/Phnom_Penh timezone
        const end = new Date(`${endDate}T23:59:59.999+07:00`);
        where.createdAt.lte = end;
      }
    }

    const driverStats = await this.prisma.driver.findMany({
      where: driverId ? { id: driverId } : {},
      include: {
        packages: {
          where: where.driverId ? {} : where,
          include: {
            merchant: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return driverStats.map((driver) => {
      const packages = driver.packages;
      const totalPackages = packages.length;
      const deliveredPackages = packages.filter(
        (pkg) => pkg.status === PackageStatus.DELIVERED,
      ).length;
      const totalCOD = packages.reduce(
        (sum, pkg) => sum + Number(pkg.codAmount),
        0,
      );
      const totalDeliveryFee = packages.reduce(
        (sum, pkg) => sum + Number(pkg.deliveryFee || 0) + Number(pkg.extraDeliveryFee || 0),
        0,
      );
      const deliveryRate =
        totalPackages > 0 ? (deliveredPackages / totalPackages) * 100 : 0;

      return {
        driverId: driver.id,
        driverName: driver.name,
        totalPackages,
        deliveredPackages,
        deliveryRate: Number(deliveryRate.toFixed(2)),
        totalCOD,
        totalDeliveryFee,
        packages: packages.map((pkg) => ({
          id: pkg.id,
          packageNumber: pkg.packageNumber,
          merchantName: pkg.merchant.name,
          customerName: pkg.customerName,
          status: pkg.status,
          codAmount: Number(pkg.codAmount),
          deliveryFee: Number(pkg.deliveryFee || 0) + Number(pkg.extraDeliveryFee || 0),
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
        })),
      };
    });
  }

  async getMerchantPerformance(
    merchantId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Record<string, any> = {};

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        // Set to beginning of day in Asia/Phnom_Penh timezone
        const start = new Date(`${startDate}T00:00:00+07:00`);
        where.createdAt.gte = start;
      }
      if (endDate) {
        // Set to end of day in Asia/Phnom_Penh timezone
        const end = new Date(`${endDate}T23:59:59.999+07:00`);
        where.createdAt.lte = end;
      }
    }

    const merchantStats = await this.prisma.merchant.findMany({
      where: merchantId ? { id: merchantId } : {},
      include: {
        packages: {
          where: where.merchantId ? {} : where,
          include: {
            driver: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return merchantStats.map((merchant) => {
      const packages = merchant.packages;
      const totalPackages = packages.length;
      const deliveredPackages = packages.filter(
        (pkg) => pkg.status === PackageStatus.DELIVERED,
      ).length;
      const totalCOD = packages.reduce(
        (sum, pkg) => sum + Number(pkg.codAmount),
        0,
      );
      const totalDeliveryFee = packages.reduce(
        (sum, pkg) => sum + Number(pkg.deliveryFee || 0) + Number(pkg.extraDeliveryFee || 0),
        0,
      );
      const deliveryRate =
        totalPackages > 0 ? (deliveredPackages / totalPackages) * 100 : 0;

      return {
        merchantId: merchant.id,
        merchantName: merchant.name,
        totalPackages,
        deliveredPackages,
        deliveryRate: Number(deliveryRate.toFixed(2)),
        totalCOD,
        totalDeliveryFee,
        packages: packages.map((pkg) => ({
          id: pkg.id,
          packageNumber: pkg.packageNumber,
          driverName: pkg.driver?.name || 'Not Assigned',
          customerName: pkg.customerName,
          status: pkg.status,
          codAmount: Number(pkg.codAmount),
          deliveryFee: Number(pkg.deliveryFee || 0) + Number(pkg.extraDeliveryFee || 0),
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
        })),
      };
    });
  }
}
