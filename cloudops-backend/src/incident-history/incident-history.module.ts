
import { Module } from '@nestjs/common';

import { IncidentHistoryService } from './incident-history.service';
import { IncidentHistoryController } from './incident-history.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [IncidentHistoryController],
  providers: [IncidentHistoryService],
})
export class IncidentHistoryModule {}
