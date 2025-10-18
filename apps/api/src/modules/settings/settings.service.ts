import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSettingDto, UpdateSettingDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAllSettings() {
    return this.prisma.settings.findMany({
      orderBy: { category: 'asc' },
    });
  }

  async getSettingsByCategory(category: string) {
    return this.prisma.settings.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    });
  }

  async getSettingByKey(key: string) {
    return this.prisma.settings.findUnique({
      where: { key },
    });
  }

  async createSetting(createSettingDto: CreateSettingDto) {
    return this.prisma.settings.create({
      data: createSettingDto,
    });
  }

  async updateSetting(key: string, updateSettingDto: UpdateSettingDto) {
    return this.prisma.settings.update({
      where: { key },
      data: updateSettingDto,
    });
  }

  async deleteSetting(key: string) {
    return this.prisma.settings.delete({
      where: { key },
    });
  }

  async upsertSetting(
    key: string,
    value: string,
    category: string = 'general',
    description?: string,
  ) {
    return this.prisma.settings.upsert({
      where: { key },
      update: { value, description },
      create: {
        key,
        value,
        category,
        description,
      },
    });
  }

  // Helper method to get settings as key-value pairs
  async getSettingsAsObject() {
    const settings = await this.prisma.settings.findMany();
    return settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, string>,
    );
  }
}
