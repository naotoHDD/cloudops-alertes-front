
import {
  Injectable,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

async create(dto: CreateUserDto) {
  // 1. Vérifier si cet email est déjà utilisé
  const existingUser = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (existingUser) {
    throw new ConflictException('Cet email existe déjà');
  }

  // 2. Hacher le mot de passe avant de l'enregistrer
  const passwordHash = await bcrypt.hash(dto.password, 12);

  // 3. Créer l'utilisateur dans PostgreSQL
  return this.prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

}

