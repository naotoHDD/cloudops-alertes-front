
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';

@Injectable()
export class ServersService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Récupérer tous les serveurs
  async findAll() {
    return this.prisma.server.findMany({
      include: {
        project: {
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

  // 2. Créer un serveur
  async create(dto: CreateServerDto) {
    // Vérifier que le projet existe
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Projet introuvable');
    }

    // Enregistrer le serveur dans PostgreSQL
    return this.prisma.server.create({
      data: {
        name: dto.name,
        provider: dto.provider,
        region: dto.region,
        cpu: dto.cpu,
        ram: dto.ram,
        storage: dto.storage,
        ipAddress: dto.ipAddress,
        ...(dto.status !== undefined && {
          status: dto.status,
        }),
        project: {
          connect: { id: dto.projectId },
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // 3. Modifier un serveur existant
  async update(id: number, dto: UpdateServerDto) {
    // Vérifier que le serveur existe
    const server = await this.prisma.server.findUnique({
      where: { id },
    });

    if (!server) {
      throw new NotFoundException('Serveur introuvable');
    }

    // Vérifier le projet si son ID est fourni
    if (dto.projectId !== undefined) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });

      if (!project) {
        throw new NotFoundException('Projet introuvable');
      }
    }

    // Modifier uniquement les informations fournies
    return this.prisma.server.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.provider !== undefined && { provider: dto.provider }),
        ...(dto.region !== undefined && { region: dto.region }),
        ...(dto.cpu !== undefined && { cpu: dto.cpu }),
        ...(dto.ram !== undefined && { ram: dto.ram }),
        ...(dto.storage !== undefined && { storage: dto.storage }),
        ...(dto.ipAddress !== undefined && {
          ipAddress: dto.ipAddress,
        }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.projectId !== undefined && {
          project: {
            connect: { id: dto.projectId },
          },
        }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // 4. Supprimer un serveur existant
  async remove(id: number) {
    // Vérifier que le serveur existe
    const server = await this.prisma.server.findUnique({
      where: { id },
    });

    if (!server) {
      throw new NotFoundException('Serveur introuvable');
    }

    // Supprimer le serveur dans PostgreSQL
    await this.prisma.server.delete({
      where: { id },
    });

    return {
      message: 'Serveur supprimé avec succès',
      id,
    };
  }
}
