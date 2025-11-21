import { useState, useCallback } from "react";
import { faceSwapApi } from "@/lib/api/face-swap";
import { useFaceSwapStore } from "@/lib/store/face-swap-store";
import { ApiError } from "@/lib/types/api.types";

export function useFaceSwap() {
  const [isUploading, setIsUploading] = useState(false);
  const store = useFaceSwapStore();

  const uploadAndProcess = useCallback(async () => {
    const {
      selectedImage,
      selectedTemplate,
      selectedGender,
      selectedCharacter,
    } = store;

    if (!selectedImage || !selectedTemplate) {
      throw new Error("Missing required data");
    }

    setIsUploading(true);
    store.setError(null);

    try {
      const response = await faceSwapApi.upload(
        selectedImage,
        selectedTemplate.id,
        selectedGender,
        selectedCharacter
      );

      store.setJobId(response.jobId);
      store.setStatus(response.status);

      return response.jobId;
    } catch (error) {
      const apiError = error as ApiError;
      store.setError(apiError.message);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [store]);

  return {
    uploadAndProcess,
    isUploading,
  };
}
