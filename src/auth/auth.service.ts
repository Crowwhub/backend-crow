import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma /prisma.service';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import {VerifyOtpDto} from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { SupabaseService } from 'src/supabase/supabase.service';


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private supabaseService: SupabaseService,
  ) {}

  // STEP 1: Request OTP
  async signupRequest(dto: RequestOtpDto) {
    const { email } = dto;

    const { error } =
      await this.supabaseService.supabase.auth.signInWithOtp({ email
        , 
        options:{
         shouldCreateUser: true, 
        }
       });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return { message: 'OTP sent to email' };
  }

  // STEP 2: Verify OTP + create user
  async signupVerify(dto: VerifyOtpDto) {
    const { email, otp, password, username } = dto;

    const { error } =
      await this.supabaseService.supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

    if (error) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const exists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        username: username ?? email.split('@')[0],
        password: hashedPassword,
      },
    });

    return {
      message: 'Signup successful',
      token: await this.signToken(user.id, user.email),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      message: 'Login successful',
      token: await this.signToken(user.id, user.email),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  private async signToken(userId: string, email: string) {
    return this.jwtService.signAsync({
      sub: userId,
      email,
    });
  }
}


