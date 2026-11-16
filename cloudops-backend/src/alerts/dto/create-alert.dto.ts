
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';

import {
  AlertSeverity,
  AlertStatus,
} from '../../generated/prisma/client';

export class CreateAlertDto {
  // Titre de l'alerte
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  // Description facultative
  @IsOptional()
  @IsString()
  description?: string;

  // Gravité de l'alerte
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  // Statut de l'alerte
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  // Serveur associé
  @IsInt()
  @Min(1)
  serverId: number;
}
