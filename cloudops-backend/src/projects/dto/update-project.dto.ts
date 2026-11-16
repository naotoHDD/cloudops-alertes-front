
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateProjectDto {
  // Modifier le nom (facultatif)
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  // Modifier la description (facultatif)
  @IsOptional()
  @IsString()
  description?: string;

  // Modifier l'équipe associée (facultatif)
  @IsOptional()
  @IsInt()
  @Min(1)
  teamId?: number;
}
