
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

import { ServersService } from './servers.service';
import { CreateServerDto } from './dto/create-server.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { UpdateServerDto } from './dto/update-server.dto';

@Controller('servers')
@UseGuards(JwtAuthGuard)
export class ServersController {
  constructor(
    private readonly serversService: ServersService,
  ) {}

  // Consulter tous les serveurs
  @Get()
  findAll() {
    return this.serversService.findAll();
  }

  // Créer un serveur : ADMIN ou DEVOPS
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DEVOPS)
  create(@Body() dto: CreateServerDto) {
    return this.serversService.create(dto);
  }

  // Modifier un serveur : ADMIN ou DEVOPS
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DEVOPS)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServerDto,
  ) {
    return this.serversService.update(id, dto);
  }


  // Supprimer un serveur : ADMIN uniquement
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serversService.remove(id);
  }

}
