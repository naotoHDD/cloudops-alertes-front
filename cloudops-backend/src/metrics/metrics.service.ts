
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMetricDto } from './dto/create-metric.dto';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  // Récupérer toutes les métriques
  async findAll() {
    return this.prisma.metric.findMany({
      include: {
        server: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
  
  
  // Enregistrer une métrique et détecter les anomalies
  async create(dto: CreateMetricDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Vérifier que le serveur existe
      const server = await tx.server.findUnique({
        where: { id: dto.serverId },
      });

      if (!server) {
        throw new NotFoundException('Serveur introuvable');
      }

      // 2. Enregistrer la métrique
      const metric = await tx.metric.create({
        data: {
          cpu: dto.cpu,
          ram: dto.ram,
          ...(dto.available !== undefined && {
            available: dto.available,
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

      // 3. Préparer les anomalies détectées
      const anomalies: {
        title: string;
        description: string;
        severity: 'HIGH' | 'CRITICAL';
      }[] = [];

      // Vérifier le CPU et la RAM si le serveur est disponible
      if (metric.available) {
        if (dto.cpu > server.cpuThreshold) {
          anomalies.push({
            title: 'High CPU usage',
            description:
              `CPU: ${dto.cpu}% - Seuil: ${server.cpuThreshold}%`,
            severity: 'HIGH',
          });
        }

        if (dto.ram > server.ramThreshold) {
          anomalies.push({
            title: 'High RAM usage',
            description:
              `RAM: ${dto.ram}% - Seuil: ${server.ramThreshold}%`,
            severity: 'HIGH',
          });
        }
      } else {
        // Serveur indisponible
        anomalies.push({
          title: 'Server unavailable',
          description:
            `Le serveur ${server.name} est indisponible.`,
          severity: 'CRITICAL',
        });
      }

      // 4. Créer les alertes sans doublons ouverts
      for (const anomaly of anomalies) {
        const existingAlert = await tx.alert.findFirst({
          where: {
            serverId: server.id,
            title: anomaly.title,
            status: {
              in: ['NEW', 'IN_PROGRESS'],
            },
          },
        });

        if (!existingAlert) {
          await tx.alert.create({
            data: {
              title: anomaly.title,
              description: anomaly.description,
              severity: anomaly.severity,
              status: 'NEW',
              server: {
                connect: { id: server.id },
              },
            },
          });
        }
      }

      // 5. Retourner la métrique enregistrée
      return metric;
    });
  }


  // Récupérer les métriques d'un serveur précis
  async findByServer(serverId: number) {
    // Vérifier que le serveur existe
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      throw new NotFoundException('Serveur introuvable');
    }

    // Récupérer les métriques du serveur
    return this.prisma.metric.findMany({
      where: {
        serverId: serverId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  // Récupérer la dernière métrique d'un serveur
  async findLatestByServer(serverId: number) {
    // Vérifier que le serveur existe
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      throw new NotFoundException('Serveur introuvable');
    }

    // Récupérer la métrique la plus récente
    return this.prisma.metric.findFirst({
      where: {
        serverId: serverId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
}
