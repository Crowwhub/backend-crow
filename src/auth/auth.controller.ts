import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
 @Post('signup')
 Signup(@Body() dto: SignupDto){
    return this.authService.signup(dto);
 }


  @Post('login')
  Login(@Body() dto: LoginDto){
    return this.authService.login(dto);
  }




}