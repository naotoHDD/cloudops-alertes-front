
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';


@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  // Récupérer toutes les alertes
  async findAll() {
    return this.prisma.alert.findMany({
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

  // Créer une nouvelle alerte
  async create(dto: CreateAlertDto) {
    // Vérifier que le serveur existe
    const server = await this.prisma.server.findUnique({
      where: { id: dto.serverId },
    });

    if (!server) {
      throw new NotFoundException('Serveur introuvable');
    }

    // Enregistrer l'alerte dans PostgreSQL
    return this.prisma.alert.create({
      data: {
        title: dto.title,
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.severity !== undefined && {
          severity: dto.severity,
        }),
        ...(dto.status !== undefined && {
          status: dto.status,
        }),
        server: {
          connect: { id: dto.serverId },
        },
      },
      include: {
        server: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  
  // Modifier une alerte et enregistrer son historique
  async update(id: number, dto: UpdateAlertDto) {
    return this.prisma.$transaction(async (tx) => {
      // Vérifier que l'alerte existe
      const alert = await tx.alert.findUnique({
        where: { id },
      });

      if (!alert) {
        throw new NotFoundException('Alerte introuvable');
      }

      // Vérifier le nouveau serveur si nécessaire
      if (dto.serverId !== undefined) {
        const server = await tx.server.findUnique({
          where: { id: dto.serverId },
        });

        if (!server) {
          throw new NotFoundException('Serveur introuvable');
        }
      }

      // Modifier l'alerte
      const updatedAlert = await tx.alert.update({
        where: { id },
        data: {
          ...(dto.title !== undefined && {
            title: dto.title,
          }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.severity !== undefined && {
            severity: dto.severity,
          }),
          ...(dto.status !== undefined && {
            status: dto.status,
          }),
          ...(dto.serverId !== undefined && {
            server: {
              connect: { id: dto.serverId },
            },
          }),
        },
        include: {
          server: {
            select: { id: true, name: true },
          },
        },
      });

      // Enregistrer uniquement les changements de statut
      if (
        dto.status !== undefined &&
        dto.status !== alert.status
      ) {
        await tx.incidentHistory.create({
          data: {
            action: 'STATUS_CHANGED',
            oldStatus: alert.status,
            newStatus: dto.status,
            alert: {
              connect: { id },
            },
          },
        });
      }

      return updatedAlert;
    });
  }


  // Supprimer une alerte
  async remove(id: number) {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new NotFoundException('Alerte introuvable');
    }

    await this.prisma.alert.delete({
      where: { id },
    });

    return {
      message: 'Alerte supprimée avec succès',
      id,
    };
  }
}
