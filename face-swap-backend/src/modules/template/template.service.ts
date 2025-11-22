import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Template, CharacterType, Gender } from './entities/template.entity';
import { TemplateFilterDto } from './dto/template-filter.dto';

@Injectable()
export class TemplateService implements OnModuleInit {
  private readonly logger = new Logger(TemplateService.name);
  private templates: Map<string, Template> = new Map();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.loadTemplates();
  }

  /**
   * Load all template metadata from JSON files
   */
  private async loadTemplates(): Promise<void> {
    const templatesDir = this.configService.get<string>('paths.templates') || './templates';
    const metadataDir = path.join(templatesDir, 'metadata');

    try {
      // Check if metadata directory exists
      try {
        await fs.access(metadataDir);
      } catch {
        this.logger.warn(`Templates metadata directory not found: ${metadataDir}`);
        this.logger.warn('Creating directory structure...');
        await fs.mkdir(metadataDir, { recursive: true });
        return;
      }

      const files = await fs.readdir(metadataDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      if (jsonFiles.length === 0) {
        this.logger.warn(`No template metadata files found in ${metadataDir}`);
        return;
      }

      for (const file of jsonFiles) {
        try {
          const filePath = path.join(metadataDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const templateData = JSON.parse(content) as Template;

          // Convert date strings to Date objects
          const template: Template = {
            ...templateData,
            createdAt: new Date(templateData.createdAt),
            updatedAt: new Date(templateData.updatedAt),
          };

          this.templates.set(template.id, template);
          this.logger.log(`Loaded template: ${template.id} - ${template.name}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Failed to load template from ${file}: ${errorMessage}`);
        }
      }

      this.logger.log(`✅ Loaded ${this.templates.size} templates`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to load templates: ${errorMessage}`);
    }
  }

  async findAll(filter?: TemplateFilterDto): Promise<Template[]> {
    let templates = Array.from(this.templates.values());

    if (filter?.character) {
      templates = templates.filter((t) => t.character === filter.character);
    }

    if (filter?.gender) {
      templates = templates.filter((t) => t.gender === filter.gender);
    }

    return templates;
  }

  async findOne(id: string): Promise<Template | null> {
    return this.templates.get(id) || null;
  }

  async getTemplateById(id: string): Promise<Template> {
    const template = this.templates.get(id);
    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    return template;
  }

  async getTemplatesByFilter(
    character?: CharacterType,
    gender?: Gender,
  ): Promise<Template[]> {
    let templates = Array.from(this.templates.values());

    if (character) {
      templates = templates.filter((t) => t.character === character);
    }

    if (gender) {
      templates = templates.filter((t) => t.gender === gender);
    }

    return templates;
  }

  async findByCharacterAndGender(
    character: CharacterType,
    gender: Gender,
  ): Promise<Template | null> {
    return (
      Array.from(this.templates.values()).find(
        (t) => t.character === character && t.gender === gender,
      ) || null
    );
  }
}

