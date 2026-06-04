import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileLikesService } from './profile-likes.service';
import { ToggleLikeDto } from './dto/toggle-like.dto';

@Controller('profile-likes')
export class ProfileLikesController {
  constructor(private readonly likes: ProfileLikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  toggle(
    @Req() req: { user: { sub: string } },
    @Body() dto: ToggleLikeDto,
  ) {
    return this.likes.toggle(req.user.sub, dto);
  }

  // GET /profile-likes?userId=<targetUserId>
  // Returns string[] of itemKeys the current user has liked on that profile.
  @UseGuards(JwtAuthGuard)
  @Get()
  listFor(
    @Req() req: { user: { sub: string } },
    @Query('userId') userId: string,
  ) {
    return this.likes.listFor(req.user.sub, userId);
  }

  // Likes received by me — used for the notifications surface.
  @UseGuards(JwtAuthGuard)
  @Get('received')
  listReceived(@Req() req: { user: { sub: string } }) {
    return this.likes.listReceived(req.user.sub);
  }
}
