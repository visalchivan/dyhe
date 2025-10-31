import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PackageStatus } from '../../../generated/client';
import { parseDateRangeForQuery } from '../../utils/timezone.util';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(startDate?: string, endDate?: string) {
    const dateRange = parseDateRangeForQuery(startDate, endDate);
    const dateFilter = dateRange
      ? {
          createdAt: {
            ...(dateRange.start ? { gte: dateRange.start } : {}),
            ...(dateRange.end ? { lte: dateRange.end } : {}),
          },
        }
      : {};
    const [
      totalPending,
      totalOnDelivery,
      totalDelivered,
      totalFailed,
      totalReturned,
    ] = await Promise.all([
      this.prisma.package.count({ where: { status: PackageStatus.PENDING, ...dateFilter } }),
      this.prisma.package.count({ where: { status: PackageStatus.ON_DELIVERY, ...dateFilter } }),
      this.prisma.package.count({ where: { status: PackageStatus.DELIVERED, ...dateFilter } }),
      this.prisma.package.count({ where: { status: PackageStatus.FAILED, ...dateFilter } }),
      this.prisma.package.count({ where: { status: PackageStatus.RETURNED, ...dateFilter } }),
    ]);
    return {
      totalPending,
      totalOnDelivery,
      totalDelivered,
      totalFailed,
      totalReturned,
    };
  }

  async getRecentPackages(limit: number = 10, startDate?: string, endDate?: string) {
    const dateRange = parseDateRangeForQuery(startDate, endDate);
    const dateFilter = dateRange
      ? {
          createdAt: {
            ...(dateRange.start ? { gte: dateRange.start } : {}),
            ...(dateRange.end ? { lte: dateRange.end } : {}),
          },
        }
      : {};
    return this.prisma.package.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      where: { ...dateFilter },
      include: {
        merchant: { select: { name: true, email: true } },
        driver: { select: { name: true, email: true } },
      },
    });
  }

  async getPackageStatusDistribution(startDate?: string, endDate?: string) {
    const dateRange = parseDateRangeForQuery(startDate, endDate);
    const dateFilter = dateRange
      ? {
          createdAt: {
            ...(dateRange.start ? { gte: dateRange.start } : {}),
            ...(dateRange.end ? { lte: dateRange.end } : {}),
          },
        }
      : {};
    const statusCounts = await this.prisma.package.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { ...dateFilter },
    });
    return statusCounts.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));
  }

  async getTopMerchants(limit: number = 5) {
    return this.prisma.merchant.findMany({
      take: limit,
      orderBy: {
        packages: {
          _count: 'desc',
        },
      },
      include: {
        _count: {
          select: {
            packages: true,
          },
        },
      },
    });
  }

  async getTopDrivers(limit: number = 5) {
    return this.prisma.driver.findMany({
      take: limit,
      orderBy: {
        packages: {
          _count: 'desc',
        },
      },
      include: {
        _count: {
          select: {
            packages: true,
          },
        },
      },
    });
  }
}
