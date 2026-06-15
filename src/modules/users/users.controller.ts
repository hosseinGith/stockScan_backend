import {
 Body,
 Controller,
 Delete,
 Get,
 Param,
 Patch,
 Post,
 Req,
 UseGuards,
 UseInterceptors,
 UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import UserUpdateDto from './dto/user-update.dto';
import { HashUserData } from 'src/shared/pipes/hash-user-data.pipe';
import { DecryptUserData } from 'src/shared/interceptors/decrypt-user-data.interceptor';
import UserUpdatePublicDto from './dto/user-update-public.dto';
import type { Request } from 'express';
import { Access } from 'src/shared/decorators/access.decorator';
import { AccessGuard } from 'src/shared/guards/access.guard';
import { UserDtoAdd } from './dto/user-add.dto';

@Controller('/api/users')
@ApiBearerAuth()
@UsePipes(HashUserData)
@UseGuards(AuthGuard)
@UseInterceptors(DecryptUserData)
export class UsersController {
 constructor(private readonly users: UsersService) {}
 @Get('/profile')
 getProfile(@Req() request: Request) {
  return this.users.getProfile(request.user.id);
 }
 @Access()
 @UseGuards(AccessGuard)
 @Get(':id')
 findOne(@Param('id') id: string) {
  return this.users.findOne(id);
 }
 @Access()
 @UseGuards(AccessGuard)
 @Get()
 findAll() {
  return this.users.findAllByWhere();
 }
 @Access()
 @UseGuards(AccessGuard)
 @Post()
 create(@Body() body: UserDtoAdd) {
  return this.users.create(body);
 }
 @Patch('/updateUserData')
 updateUserData(@Body() body: UserUpdatePublicDto, @Req() request: Request) {
  return this.users.updateUserData(body, request.user.id);
 }
 @Patch(':id')
 update(@Param('id') id: string, @Body() body: UserUpdateDto) {
  return this.users.update(id, body);
 }

 @Access()
 @UseGuards(AccessGuard)
 @Delete(':id')
 remove(@Param('id') id: string) {
  return this.users.remove(id);
 }
}
