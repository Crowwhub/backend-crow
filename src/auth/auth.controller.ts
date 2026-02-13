import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto } from './dto/request-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
 @Post('signup')
 Signup(@Body() dto: SignupDto & { otp: string }){
    return this.authService.signupVerify(dto) ;
 }


  @Post('login')
  Login(@Body() dto: LoginDto){
    return this.authService.login(dto);
  }

  @Post('signup/request-otp')
  async signupRequest(@Body() dto: RequestOtpDto) {
    return this.authService.signupRequest(dto);
  }


}