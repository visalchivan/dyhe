import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DriverGuard } from '../auth/guards/driver.guard';
import { PackagesService } from './packages.service';
import { UpdatePackageStatusDto } from './dto/update-package-status.dto';

@Controller('driver/packages')
@UseGuards(JwtAuthGuard, DriverGuard)
export class DriverPackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  async getMyPackages(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const driverId = req.user.id;
    return this.packagesService.getDriverPackages(
      driverId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
    );
  }

  @Get(':id')
  async getPackageById(@Request() req, @Param('id') id: string) {
    const driverId = req.user.id;
    return this.packagesService.getDriverPackageById(driverId, id);
  }

  @Patch(':id/status')
  async updatePackageStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdatePackageStatusDto,
  ) {
    const driverId = req.user.id;
    return this.packagesService.updatePackageStatusByDriver(
      driverId,
      id,
      updateStatusDto,
    );
  }

  @Get('stats/summary')
  async getMyStats(@Request() req) {
    const driverId = req.user.id;
    return this.packagesService.getDriverStats(driverId);
  }
}
