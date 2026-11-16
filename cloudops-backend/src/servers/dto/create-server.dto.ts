
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

export class CreateServerDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  provider!: string;

  @IsString()
  region!: string;

  @IsInt()
  @Min(1)
  cpu!: number;

  @IsInt()
  @Min(1)
  ram!: number;

  @IsInt()
  @Min(1)
  storage!: number;

  @IsIP()
  ipAddress!: string;

  @IsInt()
  @Min(1)
  projectId!: number;

  @IsOptional()
  @IsEnum(ServerStatus)
  status?: ServerStatus;
}
