
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Role } from '../../generated/prisma/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lire les rôles autorisés sur la route
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 2. Aucun rôle demandé : laisser passer
    // L'authentification reste gérée par JwtAuthGuard
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 3. Récupérer l'utilisateur authentifié
    const request = context.switchToHttp().getRequest<{
      user?: { sub: number; email: string; role: Role };
    }>();

    // 4. Vérifier son rôle
    if (!request.user || !requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException('Accès interdit pour ce rôle');
    }

    return true;
  }
}
