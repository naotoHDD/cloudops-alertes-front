
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';



import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateMetricDto } from './dto/create-metric.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/client';


@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
  ) {}

  // Récupérer toutes les métriques
  @Get()
  findAll() {
    return this.metricsService.findAll();
  }

  // Enregistrer une métrique : ADMIN ou DEVOPS
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DEVOPS)
  create(@Body() dto: CreateMetricDto) {
    return this.metricsService.create(dto);
  }

  // Récupérer les métriques d'un serveur précis
  @Get('server/:serverId')
  findByServer(
    @Param('serverId', ParseIntPipe) serverId: number,
  ) {
    return this.metricsService.findByServer(serverId);
  }

  // Récupérer la dernière métrique d'un serveur
  @Get('server/:serverId/latest')
  findLatestByServer(
    @Param('serverId', ParseIntPipe) serverId: number,
  ) {
    return this.metricsService.findLatestByServer(serverId);
  }
}
