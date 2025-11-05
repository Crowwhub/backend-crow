import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma /prisma.service';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';


@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) {}

    async signup(Dto: SignupDto) {
        const hashed = bcrypt.hashSync(Dto.password, 10);
        const user = await this.prisma.user.create({
            data : {
                username : Dto.username,
                email : Dto.email,
                password : hashed,

            },
   });
        console.log(user, "user creted")
        const token = await this.signToken(user.id, user.email);
        return {
        message: "Signup successful",
        token,
       user: {
            id: user.id,
            username: user.username,
            email: user.email,
           },
  };
       
        

        
    }

    async login (Dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where : {
                email : Dto.email,
            },

        });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const ismatch = bcrypt.compareSync(Dto.password, user.password);
        if (!ismatch) throw new UnauthorizedException('Invalid credentials');
        console.log(user , "user logged in successfully");
        return {
       message: "Login successful",
       token: await this.signToken(user.id, user.email),
       user: {
       id: user.id,
       username: user.username,
       email: user.email,
      }
};

   }


   async signToken (userId: string, email: string) {
    const payload = {
        sub: userId,
        email,
    };
    const token = await this.jwtService.signAsync(payload);
    return token;
    }

   

        




  
}

