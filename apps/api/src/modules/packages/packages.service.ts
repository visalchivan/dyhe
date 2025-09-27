import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { BulkCreatePackagesDto } from './dto/bulk-create-packages.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageStatus } from 'generated/client';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  private generatePackageNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `DYHE${timestamp}${random}`;
  }

  async create(createPackageDto: CreatePackageDto) {
    // Verify merchant exists
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: createPackageDto.merchantId },
    });

    if (!merchant) {
      throw new NotFoundException(
        `Merchant with ID ${createPackageDto.merchantId} not found`,
      );
    }

    // Verify driver exists if provided
    if (createPackageDto.driverId) {
      const driver = await this.prisma.driver.findUnique({
        where: { id: createPackageDto.driverId },
      });

      if (!driver) {
        throw new NotFoundException(
          `Driver with ID ${createPackageDto.driverId} not found`,
        );
      }
    }

    const packageNumber = this.generatePackageNumber();

    const packageData = await this.prisma.package.create({
      data: {
        packageNumber,
        name: createPackageDto.name,
        customerName: createPackageDto.customerName,
        customerPhone: createPackageDto.customerPhone,
        customerAddress: createPackageDto.customerAddress,
        codAmount: createPackageDto.codAmount,
        deliveryFee: createPackageDto.deliveryFee,
        status: createPackageDto.status || PackageStatus.RECEIVED,
        merchant: {
          connect: { id: createPackageDto.merchantId },
        },
        ...(createPackageDto.driverId && {
          driver: {
            connect: { id: createPackageDto.driverId },
          },
        }),
      },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return packageData;
  }

  async bulkCreate(bulkCreateDto: BulkCreatePackagesDto) {
    // Verify merchant exists
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: bulkCreateDto.merchantId },
    });

    if (!merchant) {
      throw new NotFoundException(
        `Merchant with ID ${bulkCreateDto.merchantId} not found`,
      );
    }

    // Verify driver exists if provided
    if (bulkCreateDto.driverId) {
      const driver = await this.prisma.driver.findUnique({
        where: { id: bulkCreateDto.driverId },
      });

      if (!driver) {
        throw new NotFoundException(
          `Driver with ID ${bulkCreateDto.driverId} not found`,
        );
      }
    }

    // Create packages in a transaction
    const packages = await this.prisma.$transaction(async (prisma) => {
      const createdPackages = [];

      for (const packageData of bulkCreateDto.packages) {
        const packageNumber = this.generatePackageNumber();

        const createdPackage = await prisma.package.create({
          data: {
            packageNumber,
            name: packageData.name,
            customerName: packageData.customerName,
            customerPhone: packageData.customerPhone,
            customerAddress: packageData.customerAddress,
            codAmount: packageData.codAmount,
            deliveryFee: packageData.deliveryFee,
            status: bulkCreateDto.status || PackageStatus.RECEIVED,
            merchant: {
              connect: { id: bulkCreateDto.merchantId },
            },
            ...(bulkCreateDto.driverId && {
              driver: {
                connect: { id: bulkCreateDto.driverId },
              },
            }),
          },
          include: {
            merchant: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            driver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        createdPackages.push(createdPackage as any as never);
      }

      return createdPackages;
    });

    return {
      message: `Successfully created ${packages.length} packages`,
      packages,
      count: packages.length,
    };
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            {
              packageNumber: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              name: { contains: search, mode: 'insensitive' as const },
            },
            {
              customerPhone: { contains: search, mode: 'insensitive' as const },
            },
            {
              customerAddress: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const [packages, total] = await Promise.all([
      this.prisma.package.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          driver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.package.count({ where }),
    ]);

    return {
      packages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const packageData = await this.prisma.package.findUnique({
      where: { id },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!packageData) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    return packageData;
  }

  async update(id: string, updatePackageDto: UpdatePackageDto) {
    // Check if package exists
    const existingPackage = await this.prisma.package.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    // Verify merchant exists if updating
    if (updatePackageDto.merchantId) {
      const merchant = await this.prisma.merchant.findUnique({
        where: { id: updatePackageDto.merchantId },
      });

      if (!merchant) {
        throw new NotFoundException(
          `Merchant with ID ${updatePackageDto.merchantId} not found`,
        );
      }
    }

    // Verify driver exists if updating
    if (updatePackageDto.driverId) {
      const driver = await this.prisma.driver.findUnique({
        where: { id: updatePackageDto.driverId },
      });

      if (!driver) {
        throw new NotFoundException(
          `Driver with ID ${updatePackageDto.driverId} not found`,
        );
      }
    }

    const { merchantId, driverId, ...packageUpdateData } = updatePackageDto;

    const packageData = await this.prisma.package.update({
      where: { id },
      data: {
        ...packageUpdateData,
        ...(merchantId && {
          merchant: {
            connect: { id: merchantId },
          },
        }),
        ...(driverId && {
          driver: {
            connect: { id: driverId },
          },
        }),
        ...(driverId === null && {
          driver: {
            disconnect: true,
          },
        }),
      },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return packageData;
  }

  async remove(id: string) {
    // Check if package exists
    const existingPackage = await this.prisma.package.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    await this.prisma.package.delete({
      where: { id },
    });

    return { message: 'Package deleted successfully' };
  }
}
