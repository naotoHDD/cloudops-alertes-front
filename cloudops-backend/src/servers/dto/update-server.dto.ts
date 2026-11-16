
import {
  IsString,
  IsInt,
  IsIP,
  IsEnum,
  IsOptional,
  Min,
  MinLength,
} from 'class-validator';

import { ServerStatus } from '../../generated/prisma/enums';

export class UpdateServerDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  cpu?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  ram?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  storage?: number;

  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  projectId?: number;

  @IsOptional()
  @IsEnum(ServerStatus)
  status?: ServerStatus;
}
