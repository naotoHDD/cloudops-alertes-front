
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

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  version: string;

  @IsInt()
  @Min(1)
  serverId: number;

  @IsInt()
  @Min(1)
  environmentId: number;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
