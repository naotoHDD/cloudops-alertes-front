
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';

// Clé utilisée pour retrouver les rôles autorisés
export const ROLES_KEY = 'roles';

// Décorateur pour définir les rôles autorisés
export const Roles = (...roles: Role[]) =>
  SetMetadata(ROLES_KEY, roles);
