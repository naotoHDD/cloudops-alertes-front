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


import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateApplicationDto } from './dto/create-application.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/client';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) {}

  // Récupérer toutes les applications
  @Get()
  findAll() {
    return this.applicationsService.findAll();
  }

  // Créer une application : ADMIN ou DEVOPS
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DEVOPS)
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  // Modifier une application : ADMIN ou DEVOPS
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DEVOPS)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(id, dto);
  }

  // Supprimer une application : ADMIN uniquement
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.applicationsService.remove(id);
  }

}

