import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { Prisma } from 'generated/client';

@Injectable()
export class MerchantService {
  constructor(private prisma: PrismaService) {}

  async create(createMerchantDto: CreateMerchantDto) {
    // Check if merchant with email or bank account number already exists
    const existingMerchant = await this.prisma.merchant.findFirst({
      where: {
        OR: [
          ...(createMerchantDto.email
            ? [{ email: createMerchantDto.email }]
            : []),
          { bankAccountNumber: createMerchantDto.bankAccountNumber },
        ],
      },
    });

    if (existingMerchant) {
      throw new ConflictException(
        'Merchant with this email or bank account number already exists',
      );
    }

    const merchant = await this.prisma.merchant.create({
      data: createMerchantDto as Prisma.MerchantCreateInput,
    });

    return merchant;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
            { address: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [merchants, total] = await Promise.all([
      this.prisma.merchant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.merchant.count({ where }),
    ]);

    return {
      merchants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
      include: {
        packages: true,
      },
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${id} not found`);
    }

    return merchant;
  }

  async update(id: string, updateMerchantDto: UpdateMerchantDto) {
    // Check if merchant exists
    const existingMerchant = await this.prisma.merchant.findUnique({
      where: { id },
    });

    if (!existingMerchant) {
      throw new NotFoundException(`Merchant with ID ${id} not found`);
    }

    // Check for conflicts if updating email or bank account number
    if (updateMerchantDto.email || updateMerchantDto.bankAccountNumber) {
      const conflictMerchant = await this.prisma.merchant.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(updateMerchantDto.email
              ? [{ email: updateMerchantDto.email }]
              : []),
            ...(updateMerchantDto.bankAccountNumber
              ? [{ bankAccountNumber: updateMerchantDto.bankAccountNumber }]
              : []),
          ],
        },
      });

      if (conflictMerchant) {
        throw new ConflictException(
          'Merchant with this email or bank account number already exists',
        );
      }
    }

    const merchant = await this.prisma.merchant.update({
      where: { id },
      data: updateMerchantDto as Prisma.MerchantUpdateInput,
    });

    return merchant;
  }

  async remove(id: string) {
    // Check if merchant exists
    const existingMerchant = await this.prisma.merchant.findUnique({
      where: { id },
    });

    if (!existingMerchant) {
      throw new NotFoundException(`Merchant with ID ${id} not found`);
    }

    // Check if merchant has packages
    const packageCount = await this.prisma.package.count({
      where: { merchantId: id },
    });

    if (packageCount > 0) {
      throw new ConflictException(
        'Cannot delete merchant with existing packages. Please remove all packages first.',
      );
    }

    await this.prisma.merchant.delete({
      where: { id },
    });

    return { message: 'Merchant deleted successfully' };
  }
}
