import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Prisma } from 'generated/client';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  async create(createDriverDto: CreateDriverDto) {
    // Check if driver with email or phone already exists
    const existingDriver = await this.prisma.driver.findFirst({
      where: {
        OR: [
          { email: createDriverDto.email },
          { phone: createDriverDto.phone },
          { bankAccountNumber: createDriverDto.bankAccountNumber },
        ],
      },
    });

    if (existingDriver) {
      throw new ConflictException(
        'Driver with this email, phone, or bank account number already exists',
      );
    }

    // Check if username is taken in users table
    if (createDriverDto.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: createDriverDto.username },
      });

      if (existingUser) {
        throw new ConflictException('Username is already taken');
      }
    }

    // Create user account if username and password are provided
    let userId: string | undefined;
    if (createDriverDto.username && createDriverDto.password) {
      const hashedPassword = await bcrypt.hash(createDriverDto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          username: createDriverDto.username,
          name: createDriverDto.name,
          email: createDriverDto.email,
          phone: createDriverDto.phone,
          password: hashedPassword,
          role: 'DRIVER',
          gender: 'MALE', // Default
          status: 'ACTIVE',
        },
      });

      userId = user.id;
    }

    // Create driver profile (remove username and password from driver data)
    const {
      username: _username,
      password: _password,
      ...driverData
    } = createDriverDto;
    const driver = await this.prisma.driver.create({
      data: {
        ...driverData,
        ...(userId && { userId }),
      } as Prisma.DriverCreateInput,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
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

  async changePassword(id: string, newPassword: string) {
    // Check if driver exists
    const existingDriver = await this.prisma.driver.findUnique({
      where: { id },
    });

    if (!existingDriver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.driver.update({
      where: { id },
      data: { user: { update: { password: hashedPassword } } },
    });

    return { message: 'Driver password changed successfully' };
  }
}
