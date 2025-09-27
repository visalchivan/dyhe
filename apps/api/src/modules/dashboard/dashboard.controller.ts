import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('recent-packages')
  getRecentPackages(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.dashboardService.getRecentPackages(limit || 10);
  }

  @Get('package-status-distribution')
  getPackageStatusDistribution() {
    return this.dashboardService.getPackageStatusDistribution();
  }

  @Get('top-merchants')
  getTopMerchants(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.dashboardService.getTopMerchants(limit || 5);
  }

  @Get('top-drivers')
  getTopDrivers(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.dashboardService.getTopDrivers(limit || 5);
  }
}
