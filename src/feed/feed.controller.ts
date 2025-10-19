import { Controller, Post, Get, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { FeedService } from './feed.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@Req() req, @Body() dto: CreatePostDto){
     return this.feedService.createPost(req.user.sub, dto);

  }

  @Get()
  findAll(){
    return this.feedService.getAllPosts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedService.getPostById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.feedService.deletePost(req.user.sub, id);
 
  }





}
