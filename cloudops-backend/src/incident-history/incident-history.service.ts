
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IncidentHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  // Récupérer tout l'historique
  async findAll() {
    return this.prisma.incidentHistory.findMany({
      include: {
        alert: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Récupérer l'historique d'une alerte
  async findByAlert(alertId: number) {
    return this.prisma.incidentHistory.findMany({
      where: { alertId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
