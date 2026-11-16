
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { IncidentHistoryService } from './incident-history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('incident-history')
@UseGuards(JwtAuthGuard)
export class IncidentHistoryController {
  constructor(
    private readonly historyService: IncidentHistoryService,
  ) {}

  // Consulter tout l'historique
  @Get()
  findAll() {
    return this.historyService.findAll();
  }

  // Consulter l'historique d'une alerte
  @Get('alert/:alertId')
  findByAlert(
    @Param('alertId', ParseIntPipe) alertId: number,
  ) {
    return this.historyService.findByAlert(alertId);
  }
}
