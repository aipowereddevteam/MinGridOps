import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../auth/schemas/user.schema';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/toggle-status')
  async toggleUserStatus(@Param('id') id: string, @CurrentUser() user: any) {
    const adminId = user?._id?.toString() || user?.id || user?.sub;
    return this.adminService.toggleUserStatus(id, adminId);
  }

  @Patch('users/:id/make-admin')
  async makeAdmin(@Param('id') id: string) {
    return this.adminService.makeAdmin(id);
  }
}
