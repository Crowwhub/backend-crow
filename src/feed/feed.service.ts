import { Injectable , ForbiddenException} from '@nestjs/common';
import {PrismaService} from '../prisma /prisma.service';
import { CreatePostDto } from './dto/create-post.dto';


@Injectable()
export class FeedService {
    constructor (  private prisma : PrismaService) {}

    //create a post 

    async createPost (userId : string , dto : CreatePostDto){
        const post = await this.prisma.post.create({
            data : {
                title: dto.title,
                description: dto.description,
                type: dto.type,
                authorId: userId,
               contributorIds: dto.contributorIds || [],
               allowJoinTeam: dto.allowJoinTeam ?? false,
               techstack: dto.techStack,
            },
        });
        return post;
    }

    async getAllPosts () {
        const posts = await this.prisma.post.findMany ({
            include : {
                author : true,
                Comment : true,
                Votes : true ,
            },
              orderBy : {
            createdAt : 'desc',
        }

        });

        
      
    }


    async getPostById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { author: true, comments: true, votes: true },
    });
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.authorId !== userId)
      throw new ForbiddenException('Not allowed to delete this post');

    await this.prisma.post.delete({ where: { id: postId } });
    return { message: 'Post deleted successfully' };
  }


}
