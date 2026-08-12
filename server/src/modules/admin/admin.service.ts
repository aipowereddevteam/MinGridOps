import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../auth/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getAllUsers() {
    return this.userModel.find().select('-password').sort({ createdAt: -1 });
  }

  async toggleUserStatus(targetUserId: string, currentAdminId?: string) {
    if (currentAdminId && targetUserId === currentAdminId) {
      throw new BadRequestException('Admins cannot deactivate their own account to prevent system lockouts');
    }

    const user = await this.userModel.findById(targetUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = !user.isActive;
    await user.save();

    return {
      message: `User ${user.email} is now ${user.isActive ? 'active' : 'deactivated'}`,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  async makeAdmin(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = UserRole.ADMIN;
    await user.save();

    return {
      message: `User ${user.email} promoted to admin`,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }
}
