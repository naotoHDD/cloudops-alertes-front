
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Récupérer tous les projets
  async findAll() {
    return this.prisma.project.findMany({
      include: {
        team: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 2. Créer un projet
  async create(dto: CreateProjectDto) {
    // Vérifier si l'équipe existe
    if (dto.teamId !== undefined) {
      const team = await this.prisma.team.findUnique({
        where: { id: dto.teamId },
      });

      if (!team) {
        throw new NotFoundException('Équipe introuvable');
      }
    }

    // Enregistrer le projet dans PostgreSQL
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        ...(dto.teamId !== undefined && {
          team: {
            connect: { id: dto.teamId },
          },
        }),
      },
      include: {
        team: true,
      },
    });
  }

  // 3. Modifier un projet existant
  async update(id: number, dto: UpdateProjectDto) {
    // Vérifier si le projet existe
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Projet introuvable');
    }

    // Vérifier si la nouvelle équipe existe
    if (dto.teamId !== undefined) {
      const team = await this.prisma.team.findUnique({
        where: { id: dto.teamId },
      });

      if (!team) {
        throw new NotFoundException('Équipe introuvable');
      }
    }

    // Modifier uniquement les champs fournis
    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.teamId !== undefined && {
          team: {
            connect: { id: dto.teamId },
          },
        }),
      },
      include: {
        team: true,
      },
    });
  }

  // Supprimer un projet existant
  async remove(id: number) {
    // 1. Vérifier si le projet existe
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Projet introuvable');
    }

    // 2. Supprimer le projet
    await this.prisma.project.delete({
      where: { id },
    });

    // 3. Confirmer la suppression
    return {
      message: 'Projet supprimé avec succès',
      id,
    };
  }
}
