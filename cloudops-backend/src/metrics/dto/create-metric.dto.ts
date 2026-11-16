
import {
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateMetricDto {
  // Pourcentage d'utilisation CPU (0 à 100)
  @IsNumber()
  @Min(0)
  @Max(100)
  cpu: number;

  // Pourcentage d'utilisation RAM (0 à 100)
  @IsNumber()
  @Min(0)
  @Max(100)
  ram: number;

  // Disponibilité du serveur (facultatif)
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  // Identifiant du serveur
  @IsInt()
  @Min(1)
  serverId: number;
}
