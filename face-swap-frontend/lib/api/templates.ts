import { apiClient } from "./client";
import { Template, CharacterType, Gender } from "@/lib/types/face-swap.types";

export const templatesApi = {
  async getAll(): Promise<Template[]> {
    const response = await apiClient.get<Template[]>("/templates");
    return response.data;
  },

  async getByFilter(
    character?: CharacterType,
    gender?: Gender
  ): Promise<Template[]> {
    const response = await apiClient.get<Template[]>("/templates/filter", {
      params: { character, gender },
    });
    return response.data;
  },

  async getById(id: string): Promise<Template> {
    const response = await apiClient.get<Template>(`/templates/${id}`);
    return response.data;
  },
};
