import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { CharacterType, Gender } from '../../template/entities/template.entity';

export class UploadFaceSwapDto {
  @IsString()
  @IsNotEmpty()
  templateId!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsEnum(CharacterType)
  character!: CharacterType;
}

