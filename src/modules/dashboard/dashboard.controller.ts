import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@Controller('api/dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
 constructor(private readonly dashboardService: DashboardService) {}

 @Get('stats')
 async getStats() {
  return this.dashboardService.getStats();
 }

 @Get('recent-products')
 async getRecentProducts() {
  return this.dashboardService.getRecentProducts();
 }

 @Get('expiring-products')
 async getExpiringProducts() {
  return this.dashboardService.getExpiringProducts();
 }

 @Get('low-stock')
 async getLowStock() {
  return this.dashboardService.getLowStockProducts();
 }

 @Get('overview')
 async getOverview() {
  return this.dashboardService.getOverview();
 }
}
