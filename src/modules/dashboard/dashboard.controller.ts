import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { AccessGuard } from 'src/shared/guards/access.guard';
import { Role } from '../users/types';
import { Access } from 'src/shared/decorators/access.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('api/dashboard')
@ApiBearerAuth()
@Access(Role.ADMIN)
@UseGuards(AuthGuard, AccessGuard)
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
