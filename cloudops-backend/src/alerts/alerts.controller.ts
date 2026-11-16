
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';


import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateAlertDto } from './dto/create-alert.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/client';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(
    private readonly alertsService: AlertsService,
  ) {}

  // Récupérer toutes les alertes
  @Get()
  findAll() {
    return this.alertsService.findAll();
  }

  // Créer une alerte : ADMIN ou DEVOPS
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DEVOPS)
  create(@Body() dto: CreateAlertDto) {
    return this.alertsService.create(dto);
  }

  // Modifier une alerte : ADMIN ou DEVOPS
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DEVOPS)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAlertDto,
  ) {
    return this.alertsService.update(id, dto);
  }

  // Supprimer une alerte : ADMIN uniquement
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.remove(id);
  }
}
