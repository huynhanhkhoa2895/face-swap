import { apiClient } from "./client";
import {
  UploadResponse,
  JobStatusResponse,
  CharacterType,
  Gender,
} from "@/lib/types/face-swap.types";

export const faceSwapApi = {
  async upload(
    file: File,
    templateId: string,
    gender: Gender,
    character: CharacterType
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("templateId", templateId);
    formData.append("gender", gender);
    formData.append("character", character);

    const response = await apiClient.post<UploadResponse>(
      "/face-swap/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async getStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await apiClient.get<JobStatusResponse>(
      `/face-swap/status/${jobId}`
    );
    return response.data;
  },

  getDownloadUrl(jobId: string): string {
    return `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    }/face-swap/download/${jobId}`;
  },
};
