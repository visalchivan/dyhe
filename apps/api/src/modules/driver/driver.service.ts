import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Prisma } from 'generated/client';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  async create(createDriverDto: CreateDriverDto) {
    // Check if driver with email already exists
    const existingDriver = await this.prisma.driver.findFirst({
      where: {
        OR: [
          { email: createDriverDto.email },
          { bankAccountNumber: createDriverDto.bankAccountNumber },
        ],
      },
    });

    if (existingDriver) {
      throw new ConflictException(
        'Driver with this email or bank account number already exists',
      );
    }

    const driver = await this.prisma.driver.create({
      data: createDriverDto as Prisma.DriverCreateInput,
    });

    return driver;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [drivers, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where }),
    ]);

    return {
      drivers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        packages: true,
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  async update(id: string, updateDriverDto: UpdateDriverDto) {
    // Check if driver exists
    const existingDriver = await this.prisma.driver.findUnique({
      where: { id },
    });

    if (!existingDriver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    // Check for conflicts if updating email or bank account number
    if (updateDriverDto.email || updateDriverDto.bankAccountNumber) {
      const conflictDriver = await this.prisma.driver.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(updateDriverDto.email
              ? [{ email: updateDriverDto.email }]
              : []),
            ...(updateDriverDto.bankAccountNumber
              ? [{ bankAccountNumber: updateDriverDto.bankAccountNumber }]
              : []),
          ],
        },
      });

      if (conflictDriver) {
        throw new ConflictException(
          'Driver with this email or bank account number already exists',
        );
      }
    }

    const driver = await this.prisma.driver.update({
      where: { id },
      data: updateDriverDto as Prisma.DriverUpdateInput,
    });

    return driver;
  }

  async remove(id: string) {
    // Check if driver exists
    const existingDriver = await this.prisma.driver.findUnique({
      where: { id },
    });

    if (!existingDriver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    // Check if driver has packages
    const packageCount = await this.prisma.package.count({
      where: { driverId: id },
    });

    if (packageCount > 0) {
      throw new ConflictException(
        'Cannot delete driver with existing packages. Please remove all packages first.',
      );
    }

    await this.prisma.driver.delete({
      where: { id },
    });

    return { message: 'Driver deleted successfully' };
  }
}
