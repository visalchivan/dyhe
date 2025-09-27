import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalReceived,
      totalDelivered,
      totalPending,
      onDelivery,
      totalFailed,
      totalReturned,
    ] = await Promise.all([
      // Total Received - all packages created
      this.prisma.package.count(),

      // Total Delivered - packages with DELIVERED status
      this.prisma.package.count({
        where: { status: 'DELIVERED' },
      }),

      // Total Pending - packages awaiting pickup
      this.prisma.package.count({
        where: { status: 'RECEIVED' },
      }),

      // On Delivery - packages currently in transit
      this.prisma.package.count({
        where: { status: 'DELIVERING' },
      }),

      // Total Failed - packages with failed status
      this.prisma.package.count({
        where: { status: 'CANCELLED' },
      }),

      // Total Returned - packages that were returned
      this.prisma.package.count({
        where: { status: 'RETURNED' },
      }),
    ]);

    return {
      totalReceived,
      totalDelivered,
      totalPending,
      onDelivery,
      totalFailed,
      totalReturned,
    };
  }

  async getRecentPackages(limit: number = 10) {
    return this.prisma.package.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        merchant: {
          select: {
            name: true,
            email: true,
          },
        },
        driver: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getPackageStatusDistribution() {
    const statusCounts = await this.prisma.package.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
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
