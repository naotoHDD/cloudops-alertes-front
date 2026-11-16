
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

export class UpdateAlertDto {
  // Titre de l'alerte
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title?: string;

  // Description de l'alerte
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
  @IsOptional()
  @IsInt()
  @Min(1)
  serverId?: number;
}
