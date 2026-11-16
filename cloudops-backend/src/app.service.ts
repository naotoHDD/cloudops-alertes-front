
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkDatabase() {
    const usersCount = await this.prisma.user.count();

    return {
      database: 'connected',
      usersCount,
    };
  }
}
