import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { BulkCreatePackagesDto } from './dto/bulk-create-packages.dto';
import { BulkAssignPackagesDto } from './dto/bulk-assign-packages.dto';
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
        name: `Package ${packageNumber}`, // Auto-generate name from package number
        price: createPackageDto.codAmount || 0, // Using codAmount as price, default to 0
        customerName: createPackageDto.customerName,
        customerPhone: createPackageDto.customerPhone,
        customerAddress: createPackageDto.customerAddress,
        codAmount: createPackageDto.codAmount || 0,
        deliveryFee: createPackageDto.deliveryFee || 0,
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
    console.log('Service received:', JSON.stringify(bulkCreateDto, null, 2));

    // Verify merchant exists
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: bulkCreateDto.merchantId },
    });

    if (!merchant) {
      throw new NotFoundException(
        `Merchant with ID ${bulkCreateDto.merchantId} not found`,
      );
    }

    // Validate packages array
    if (!bulkCreateDto.packages || bulkCreateDto.packages.length === 0) {
      throw new BadRequestException('At least one package is required');
    }

    // Validate each package has required fields
    for (const packageData of bulkCreateDto.packages) {
      if (
        !packageData.customerName ||
        !packageData.customerPhone ||
        !packageData.customerAddress
      ) {
        throw new BadRequestException(
          'Each package must have customer name, phone, and address',
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
            name: `Package ${packageNumber}`, // Auto-generate name from package number
            price: packageData.codAmount || 0, // Using codAmount as price, default to 0
            customerName: packageData.customerName,
            customerPhone: packageData.customerPhone,
            customerAddress: packageData.customerAddress,
            codAmount: packageData.codAmount || 0,
            deliveryFee: packageData.deliveryFee || 0,
            status: bulkCreateDto.status || PackageStatus.RECEIVED,
            merchant: {
              connect: { id: bulkCreateDto.merchantId },
            },
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

  async bulkAssign(bulkAssignDto: BulkAssignPackagesDto) {
    console.log(
      'Service received bulk assign:',
      JSON.stringify(bulkAssignDto, null, 2),
    );

    // Verify driver exists
    const driver = await this.prisma.driver.findUnique({
      where: { id: bulkAssignDto.driverId },
    });

    if (!driver) {
      throw new NotFoundException(
        `Driver with ID ${bulkAssignDto.driverId} not found`,
      );
    }

    // Verify all packages exist and are available for assignment
    const packages = await this.prisma.package.findMany({
      where: {
        packageNumber: { in: bulkAssignDto.packageNumbers },
      },
    });

    if (packages.length !== bulkAssignDto.packageNumbers.length) {
      const foundNumbers = packages.map((p) => p.packageNumber);
      const missingNumbers = bulkAssignDto.packageNumbers.filter(
        (num) => !foundNumbers.includes(num),
      );
      throw new BadRequestException(
        `Packages not found: ${missingNumbers.join(', ')}`,
      );
    }

    // Check if packages are already assigned to other drivers
    const alreadyAssigned = packages.filter(
      (p) => p.driverId && p.driverId !== bulkAssignDto.driverId,
    );
    if (alreadyAssigned.length > 0) {
      throw new BadRequestException(
        `Some packages are already assigned to other drivers: ${alreadyAssigned.map((p) => p.packageNumber).join(', ')}`,
      );
    }

    // Update packages in a transaction
    const updatedPackages = await this.prisma.$transaction(async (prisma) => {
      const updatePromises = bulkAssignDto.packageNumbers.map((packageNumber) =>
        prisma.package.update({
          where: { packageNumber },
          data: {
            driverId: bulkAssignDto.driverId,
            status: bulkAssignDto.status || PackageStatus.READY,
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
        }),
      );

      return Promise.all(updatePromises);
    });

    return {
      message: `Successfully assigned ${updatedPackages.length} packages to driver`,
      packages: updatedPackages,
      count: updatedPackages.length,
    };
  }
}
