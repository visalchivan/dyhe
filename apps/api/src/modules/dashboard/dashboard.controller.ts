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
  getDashboardStats(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.dashboardService.getDashboardStats(startDate, endDate);
  }

  @Get('recent-packages')
  getRecentPackages(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.dashboardService.getRecentPackages(limit || 10, startDate, endDate);
  }

  @Get('package-status-distribution')
  getPackageStatusDistribution(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.dashboardService.getPackageStatusDistribution(startDate, endDate);
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
