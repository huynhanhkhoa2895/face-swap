import { IsEnum, IsOptional } from 'class-validator';
import { CharacterType, Gender } from '../entities/template.entity';

export class TemplateFilterDto {
  @IsOptional()
  @IsEnum(CharacterType)
  character?: CharacterType;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}

export class TemplateResponseDto {
  id!: string;
  name!: string;
  character!: CharacterType;
  gender!: Gender;
  thumbnailUrl!: string;
  duration!: number;
}

