import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma /prisma.service';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { SupabaseService } from 'src/supabase/supabase.service';


@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService , private SupabaseService: SupabaseService) {}

    async signupRequest(email: string){
        const { error } = await this.SupabaseService.supabase.auth.signInWithOtp({ email });
        if (error) throw new Error(error.message);

        return  {message: "OTP sent to the Email"}
    }

    
    
//     async signup(Dto: SignupDto) {
//         const hashed = bcrypt.hashSync(Dto.password, 10);
//         const user = await this.prisma.user.create({
//             data : {
//                 username : Dto.username,
//                 email : Dto.email,
//                 password : hashed,

//             },
//    });
//         console.log(user, "user created")
//         const token = await this.signToken(user.id, user.email);
//         return {
//         message: "Signup successful",
//         token,
//        user: {
//             id: user.id,
//             username: user.username,
//             email: user.email,
//            },
//   };
       
        

        
//     }

async signupVerify(Dto: SignupDto & {otp: string}){
    const {error} = 
    await this.SupabaseService.supabase.auth.verifyOtp({
        email: Dto.email,
      token: Dto.otp,
      type: 'email',
    })

    if (error) {
        throw new UnauthorizedException('Invalid OTP');
    }
    const exists = await this.prisma.user.findUnique({
        where : {email: Dto.email}
    })

    if (exists) {
        throw new UnauthorizedException('User already exists');
    }
    const hashed = await bcrypt.hash(Dto.password, 10);
    const user = await this.prisma.user.create({
       data: {
           username: Dto.username ?? Dto.email.split('@')[0],
           email: Dto.email,
           password: hashed,
       },
    });

    const token = await this.signToken(user.id, user.email);
    return {
      message: "Signup successful",
      token,
      user: {
        id: user.id,

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

