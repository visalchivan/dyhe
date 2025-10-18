import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto, UpdateSettingDto } from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../../generated/client';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Get('category/:category')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getSettingsByCategory(@Param('category') category: string) {
    return this.settingsService.getSettingsByCategory(category);
  }

  @Get('key/:key')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getSettingByKey(@Param('key') key: string) {
    return this.settingsService.getSettingByKey(key);
  }

  @Get('object')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getSettingsAsObject() {
    return this.settingsService.getSettingsAsObject();
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async createSetting(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.createSetting(createSettingDto);
  }

  @Put(':key')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async updateSetting(
    @Param('key') key: string,
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    return this.settingsService.updateSetting(key, updateSettingDto);
  }

  @Delete(':key')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async deleteSetting(@Param('key') key: string) {
    return this.settingsService.deleteSetting(key);
  }

  // Bulk update endpoint for settings form
  @Post('bulk-update')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async bulkUpdateSettings(@Body() settings: Record<string, string>) {
    const promises = Object.entries(settings).map(([key, value]) =>
      this.settingsService.upsertSetting(key, value),
    );
    await Promise.all(promises);
    return { message: 'Settings updated successfully' };
  }
}
