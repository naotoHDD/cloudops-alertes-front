
import { Module } from '@nestjs/common';

import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { IncidentHistoryModule } from '../incident-history/incident-history.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}

