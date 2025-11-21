import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Template, CharacterType, Gender } from './entities/template.entity';
import { TemplateFilterDto } from './dto/template-filter.dto';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private templates: Template[] = [];

  constructor(private readonly configService: ConfigService) {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Initialize with sample templates
    // In production, this would load from database
    this.templates = [
      {
        id: '1',
        name: 'Colleague Male Template',
        character: CharacterType.COLLEAGUE,
        gender: Gender.MALE,
        videoPath: 'templates/colleague_male.mp4',
        thumbnailPath: 'templates/colleague_male_thumb.jpg',
        duration: 10,
        fps: 30,
        resolution: { width: 1920, height: 1080 },
        facePosition: { x: 500, y: 300, width: 400, height: 400 },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Boss Male Template',
        character: CharacterType.BOSS,
        gender: Gender.MALE,
        videoPath: 'templates/boss_male.mp4',
        thumbnailPath: 'templates/boss_male_thumb.jpg',
        duration: 10,
        fps: 30,
        resolution: { width: 1920, height: 1080 },
        facePosition: { x: 500, y: 300, width: 400, height: 400 },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Homie Male Template',
        character: CharacterType.HOMIE,
        gender: Gender.MALE,
        videoPath: 'templates/homie_male.mp4',
        thumbnailPath: 'templates/homie_male_thumb.jpg',
        duration: 10,
        fps: 30,
        resolution: { width: 1920, height: 1080 },
        facePosition: { x: 500, y: 300, width: 400, height: 400 },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async findAll(filter?: TemplateFilterDto): Promise<Template[]> {
    let filtered = [...this.templates];

    if (filter?.character) {
      filtered = filtered.filter((t) => t.character === filter.character);
    }

    if (filter?.gender) {
      filtered = filtered.filter((t) => t.gender === filter.gender);
    }

    return filtered;
  }

  async findOne(id: string): Promise<Template | null> {
    return this.templates.find((t) => t.id === id) || null;
  }

  async findByCharacterAndGender(
    character: CharacterType,
    gender: Gender,
  ): Promise<Template | null> {
    return (
      this.templates.find(
        (t) => t.character === character && t.gender === gender,
      ) || null
    );
  }
}

