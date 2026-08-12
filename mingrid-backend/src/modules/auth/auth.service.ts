import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  private setAuthCookie(res: Response, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  private clearAuthCookie(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      expires: new Date(0),
      path: '/',
    });
  }

  async register(registerDto: RegisterDto, res: Response) {
    const { name, email, password } = registerDto;

    const existingUser = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = this.jwtService.sign({
      sub: newUser._id.toString(),
      email: newUser.email,
    });

    this.setAuthCookie(res, token);

    return {
      message: 'Registration successful',
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    };
  }

  async login(loginDto: LoginDto, res: Response) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      sub: user._id.toString(),
      email: user.email,
    });

    this.setAuthCookie(res, token);

    return {
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    };
  }

  async logout(res: Response) {
    this.clearAuthCookie(res);
    return { message: 'Logged out successfully' };
  }

  async getMe(user: UserDocument) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };
  }
}
