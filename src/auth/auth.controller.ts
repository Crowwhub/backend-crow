import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Step 1 of signup: user submits their email. We send an OTP to it.
   */
  @Post('signup/request-otp')
  signupRequest(@Body() dto: RequestOtpDto) {
    return this.authService.signupRequest(dto);
  }

  /**
   * Step 2 of signup: user submits email + OTP + password (+ optional username).
   * On success we create the user row and return a JWT.
   */
  @Post('signup')
  signupVerify(@Body() dto: VerifyOtpDto) {
    return this.authService.signupVerify(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
