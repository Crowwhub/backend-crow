import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { SwipesService } from './swipes.service';
import { CreateSwipeDto } from './dto/create-swipe.dto';
import { SwipeFeedDto } from './dto/swipe-feed.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('swipes')
export class SwipesController {
  constructor(private readonly swipesService: SwipesService) {}


  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getFeed(@Req() req , @Query() dto: SwipeFeedDto){
    const userID = req.user.sub;
    return this.swipesService.swipefeed(userID , dto)
  }


  @UseGuards(JwtAuthGuard)
  @Post()
  async createSwipe(@Req() req , @Body() dto : CreateSwipeDto){
    const userId = req.user.sub;
    return this.swipesService.createSwipe (userId , dto);

  }
 @UseGuards(JwtAuthGuard) 
  @Get('requests')
  async getIncomingRequests(@Req() req) {
  const userId = req.user.sub
  return this.swipesService.getincomingSwipes(userId);
}

}
