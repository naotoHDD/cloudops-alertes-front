
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Récupérer toutes les applications
  async findAll() {
    return this.prisma.application.findMany({
      include: {
        server: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Créer une application
  async create(dto: CreateApplicationDto) {
    // Vérifier que le serveur existe
    const server = await this.prisma.server.findUnique({
      where: { id: dto.serverId },
    });

    if (!server) {
      throw new NotFoundException('Serveur introuvable');
    }

    // Vérifier que l'environnement existe
    const environment = await this.prisma.environment.findUnique({
      where: { id: dto.environmentId },
    });

    if (!environment) {
      throw new NotFoundException('Environnement introuvable');
    }

    // Enregistrer l'application
    return this.prisma.application.create({
      data: {
        name: dto.name,
        version: dto.version,
        ...(dto.status !== undefined && {
          status: dto.status,
        }),
        server: {
          connect: { id: dto.serverId },
        },
        environment: {
          connect: { id: dto.environmentId },
        },
      },
      include: {
        server: {
          select: { id: true, name: true },
        },
        environment: true,
      },
    });
  }

  // Modifier une application existante
  async update(id: number, dto: UpdateApplicationDto) {
    // Vérifier que l'application existe
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application introuvable');
    }

    // Vérifier le nouveau serveur si fourni
    if (dto.serverId !== undefined) {
      const server = await this.prisma.server.findUnique({
        where: { id: dto.serverId },
      });

      if (!server) {
        throw new NotFoundException('Serveur introuvable');
      }
    }

    // Vérifier le nouvel environnement si fourni
    if (dto.environmentId !== undefined) {
      const environment = await this.prisma.environment.findUnique({
        where: { id: dto.environmentId },
      });

      if (!environment) {
        throw new NotFoundException('Environnement introuvable');
      }
    }

    // Enregistrer les modifications
    return this.prisma.application.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.version !== undefined && { version: dto.version }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.serverId !== undefined && {
          server: { connect: { id: dto.serverId } },
        }),
        ...(dto.environmentId !== undefined && {
          environment: { connect: { id: dto.environmentId } },
        }),
      },
      include: {
        server: { select: { id: true, name: true } },
        environment: { select: { id: true, name: true } },
      },
    });
  }

  // Supprimer une application
  async remove(id: number) {
    // Vérifier que l'application existe
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application introuvable');
    }

    // Supprimer l'application dans PostgreSQL
    await this.prisma.application.delete({
      where: { id },
    });

    return {
      message: 'Application supprimée avec succès',
      id,
    };
  }

}

