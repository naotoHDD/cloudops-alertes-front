
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsInt,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';

import { ApplicationStatus } from '../../generated/prisma/client';

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  version?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  serverId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  environmentId?: number;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
