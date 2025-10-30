import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { BulkCreatePackagesDto } from './dto/bulk-create-packages.dto';
import { BulkAssignPackagesDto } from './dto/bulk-assign-packages.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { UpdatePackageStatusDto } from './dto/update-package-status.dto';
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
        price: createPackageDto.codAmount || 0, // Using codAmount as price, default to 0
        customerName: createPackageDto.customerName,
        customerPhone: createPackageDto.customerPhone,
        customerAddress: createPackageDto.customerAddress,
        codAmount: createPackageDto.codAmount || 0,
        deliveryFee: createPackageDto.deliveryFee || 0,
        status: createPackageDto.status || PackageStatus.PENDING,
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
            phone: true,
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
            price: packageData.codAmount || 0, // Using codAmount as price, default to 0
            customerName: packageData.customerName,
            customerPhone: packageData.customerPhone,
            customerAddress: packageData.customerAddress,
            codAmount: packageData.codAmount || 0,
            deliveryFee: packageData.deliveryFee || 0,
            status: bulkCreateDto.status || PackageStatus.PENDING,
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

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    merchantId?: string,
    driverId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    // Add search filter
    if (search) {
      where.OR = [
        {
          packageNumber: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          customerName: { contains: search, mode: 'insensitive' as const },
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
        {
          merchant: {
            name: { contains: search, mode: 'insensitive' as const },
          },
        },
        {
          merchant: {
            phone: { contains: search, mode: 'insensitive' as const },
          },
        },
      ];
    }

    // Add merchant filter
    if (merchantId) {
      where.merchantId = merchantId;
    }

    // Add driver filter
    if (driverId) {
      if (driverId === 'unassigned') {
        where.driverId = null;
      } else {
        where.driverId = driverId;
      }
    }

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
              phone: true,
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
            phone: true,
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
            phone: true,
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
            status: bulkAssignDto.status || PackageStatus.ON_DELIVERY,
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

  // Driver-specific methods
  async getDriverPackages(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
  ) {
    // Find driver record by userId
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    const skip = (page - 1) * limit;

    const where: any = { driverId: driver.id };
    if (status) {
      where.status = status;
    }

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
              phone: true,
              address: true,
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

  async getDriverPackageById(userId: string, packageId: string) {
    // Find driver record by userId
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    const packageData = await this.prisma.package.findFirst({
      where: {
        id: packageId,
        driverId: driver.id,
      },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            googleMapsUrl: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!packageData) {
      throw new NotFoundException('Package not found or not assigned to you');
    }

    return packageData;
  }

  async updatePackageStatusByDriver(
    userId: string,
    packageId: string,
    updateStatusDto: UpdatePackageStatusDto,
  ) {
    // Find driver record by userId
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    // Verify package belongs to this driver
    const packageData = await this.prisma.package.findFirst({
      where: {
        id: packageId,
        driverId: driver.id,
      },
    });

    if (!packageData) {
      throw new ForbiddenException(
        'You can only update packages assigned to you',
      );
    }

    // Update package status
    const updatedPackage = await this.prisma.package.update({
      where: { id: packageId },
      data: {
        status: updateStatusDto.status,
      },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return updatedPackage;
  }

  async getDriverStats(userId: string) {
    // Find driver record by userId
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    const driverId = driver.id;
    const [total, delivering, delivered, cancelled, returned, todayDelivered] =
      await Promise.all([
        this.prisma.package.count({ where: { driverId } }),
        this.prisma.package.count({
          where: { driverId, status: PackageStatus.ON_DELIVERY },
        }),
        this.prisma.package.count({
          where: { driverId, status: PackageStatus.DELIVERED },
        }),
        this.prisma.package.count({
          where: { driverId, status: PackageStatus.FAILED },
        }),
        this.prisma.package.count({
          where: { driverId, status: PackageStatus.RETURNED },
        }),
        this.prisma.package.count({
          where: {
            driverId,
            status: PackageStatus.DELIVERED,
            updatedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ]);

    // Calculate total COD amount for delivered packages
    const deliveredPackages = await this.prisma.package.findMany({
      where: {
        driverId,
        status: PackageStatus.DELIVERED,
      },
      select: {
        codAmount: true,
      },
    });

    const totalCOD = deliveredPackages.reduce(
      (sum, pkg) => sum + Number(pkg.codAmount),
      0,
    );

    return {
      total,
      delivering,
      delivered,
      cancelled,
      returned,
      todayDelivered,
      totalCOD,
    };
  }
}
