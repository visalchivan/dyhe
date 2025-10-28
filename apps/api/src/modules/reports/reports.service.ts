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
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
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
          deliveryFee: Number(pkg.deliveryFee),
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
      (sum, pkg) => sum + Number(pkg.deliveryFee),
      0,
    );

    const deliveredPackages = allPackages.filter(
      (pkg) => pkg.status === PackageStatus.DELIVERED,
    ).length;
    const pendingPackages = allPackages.filter((pkg) =>
      [
        PackageStatus.READY,
        PackageStatus.DELIVERING,
        PackageStatus.PREPARING,
      ].includes(pkg.status as any),
    ).length;
    const cancelledPackages = allPackages.filter(
      (pkg) => pkg.status === PackageStatus.CANCELLED,
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
      cancelledPackages,
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
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
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
        (sum, pkg) => sum + Number(pkg.deliveryFee),
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
          deliveryFee: Number(pkg.deliveryFee),
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
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
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
        (sum, pkg) => sum + Number(pkg.deliveryFee),
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
          deliveryFee: Number(pkg.deliveryFee),
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
        })),
      };
    });
  }
}
