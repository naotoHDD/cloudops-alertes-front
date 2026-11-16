
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UseGuards,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  // Consulter tous les projets
  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  // Créer un projet : ADMIN ou DEVOPS
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DEVOPS)
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  // Modifier un projet : ADMIN ou DEVOPS
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DEVOPS)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  // Supprimer un projet : ADMIN uniquement
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.remove(id);
  }


}

