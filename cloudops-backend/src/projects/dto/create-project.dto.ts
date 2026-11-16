
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto {
  // Nom obligatoire du projet
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  // Description facultative
  @IsOptional()
  @IsString()
  description?: string;

  // Identifiant facultatif de l'équipe
  @IsOptional()
  @IsInt()
  @Min(1)
  teamId?: number;
}
