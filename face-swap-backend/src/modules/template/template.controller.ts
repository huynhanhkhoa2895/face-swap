import { Controller, Get, Param, Query } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateFilterDto, TemplateResponseDto } from './dto/template-filter.dto';
import { Template } from './entities/template.entity';

@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  async findAll(
    @Query() filter: TemplateFilterDto,
  ): Promise<TemplateResponseDto[]> {
    const templates = await this.templateService.findAll(filter);
    return templates.map(this.toResponseDto);
  }

  @Get('filter')
  async filter(@Query() filter: TemplateFilterDto): Promise<TemplateResponseDto[]> {
    const templates = await this.templateService.findAll(filter);
    return templates.map(this.toResponseDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TemplateResponseDto> {
    const template = await this.templateService.findOne(id);
    if (!template) {
      throw new Error('Template not found');
    }
    return this.toResponseDto(template);
  }

  private toResponseDto(template: Template): TemplateResponseDto {
    return {
      id: template.id,
      name: template.name,
      character: template.character,
      gender: template.gender,
      thumbnailUrl: `/templates/${template.thumbnailPath}`,
      duration: template.duration,
    };
  }
}

