
import { Module } from '@nestjs/common';

import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
