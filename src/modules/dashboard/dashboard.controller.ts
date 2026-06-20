import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { AccessGuard } from 'src/shared/guards/access.guard';
import { Role } from '../users/types';
import { Access } from 'src/shared/decorators/access.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import SkipAuth from 'src/shared/decorators/skip-auth.decorator';

@Controller('api/dashboard')
@ApiBearerAuth()
@Access(Role.ADMIN)
@UseGuards(AuthGuard, AccessGuard)
export class DashboardController {
 constructor(private readonly dashboardService: DashboardService) {}

 @SkipAuth()
@Get('stats')
 async getStats() {
  return this.dashboardService.getStats();
 }

 @SkipAuth()
@Get('recent-products')
 async getRecentProducts() {
  return this.dashboardService.getRecentProducts();
 }

 @SkipAuth()
@Get('expiring-products')
 async getExpiringProducts() {
  return this.dashboardService.getExpiringProducts();
 }

 @SkipAuth()
@Get('low-stock')
 async getLowStock() {
  return this.dashboardService.getLowStockProducts();
 }

 @SkipAuth()
@Get('overview')
 async getOverview() {
  return this.dashboardService.getOverview();
 }
}
