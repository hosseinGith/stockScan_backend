import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Request } from 'express';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@Controller('api/dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
 constructor(private readonly dashboardService: DashboardService) {}

 @Get('stats')
 async getStats(@Req() request: Request) {
  return this.dashboardService.getStats(request.user.id);
 }

 @Get('recent-products')
 async getRecentProducts(@Req() request: Request) {
  return this.dashboardService.getRecentProducts(request.user.id);
 }

 @Get('expiring-products')
 async getExpiringProducts(@Req() request: Request) {
  return this.dashboardService.getExpiringProducts(request.user.id);
 }

 @Get('low-stock')
 async getLowStock(@Req() request: Request) {
  return this.dashboardService.getLowStockProducts(request.user.id);
 }

 @Get('overview')
 async getOverview(@Req() request: Request) {
  return this.dashboardService.getOverview(request.user.id);
 }
}
