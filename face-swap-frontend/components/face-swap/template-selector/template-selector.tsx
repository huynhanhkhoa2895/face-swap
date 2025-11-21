'use client';

import { useEffect, useState } from 'react';
import { Template } from '@/lib/types/face-swap.types';
import { templatesApi } from '@/lib/api/templates';
import { useFaceSwapStore } from '@/lib/store/face-swap-store';
import Card from '@/components/ui/card/card';
import './template-selector.style.scss';

export default function TemplateSelector() {
  const { selectedTemplate, selectedGender, selectedCharacter, setTemplate } =
    useFaceSwapStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const filtered = await templatesApi.getByFilter(
          selectedCharacter,
          selectedGender,
        );
        setTemplates(filtered);
        if (filtered.length > 0 && !selectedTemplate) {
          setTemplate(filtered[0]);
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [selectedGender, selectedCharacter, selectedTemplate, setTemplate]);

  if (loading) {
    return <div className="template-selector__loading">Loading templates...</div>;
  }

  return (
    <Card className="template-selector">
      <h3 className="template-selector__title">Chọn template</h3>
      <div className="template-selector__grid">
        {templates.map((template) => (
          <button
            key={template.id}
            className={`template-selector__item ${
              selectedTemplate?.id === template.id
                ? 'template-selector__item--active'
                : ''
            }`}
            onClick={() => setTemplate(template)}
          >
            <img
              src={template.thumbnailUrl}
              alt={template.name}
              className="template-selector__thumbnail"
            />
            <p className="template-selector__name">{template.name}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}

