
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // 1. Rechercher l'utilisateur dans PostgreSQL
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // 2. Vérifier si le compte existe
    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    // 3. Vérifier le mot de passe avec bcrypt
    const passwordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    // 4. Préparer les informations du JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // 5. Générer un JWT signé
    const accessToken = await this.jwtService.signAsync(payload);

    // 6. Retourner le token et les informations publiques
    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

