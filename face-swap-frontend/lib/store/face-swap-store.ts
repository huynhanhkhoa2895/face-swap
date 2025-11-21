import { create } from "zustand";
import {
  Template,
  CharacterType,
  Gender,
  JobStatus,
  JobProgress,
} from "@/lib/types/face-swap.types";

interface FaceSwapState {
  // Upload state
  selectedImage: File | null;
  imagePreview: string | null;

  // Selection state
  selectedGender: Gender;
  selectedCharacter: CharacterType;
  selectedTemplate: Template | null;

  // Processing state
  jobId: string | null;
  status: JobStatus | "idle";
  progress: JobProgress | null;
  error: string | null;
  videoUrl: string | null;

  // Actions
  setImage: (file: File | null) => void;
  setGender: (gender: Gender) => void;
  setCharacter: (character: CharacterType) => void;
  setTemplate: (template: Template | null) => void;
  setJobId: (jobId: string) => void;
  setStatus: (status: JobStatus | "idle") => void;
  setProgress: (progress: JobProgress | null) => void;
  setError: (error: string | null) => void;
  setVideoUrl: (url: string | null) => void;
  reset: () => void;
}

const initialState = {
  selectedImage: null,
  imagePreview: null,
  selectedGender: Gender.MALE,
  selectedCharacter: CharacterType.COLLEAGUE,
  selectedTemplate: null,
  jobId: null,
  status: "idle" as const,
  progress: null,
  error: null,
  videoUrl: null,
};

export const useFaceSwapStore = create<FaceSwapState>((set) => ({
  ...initialState,

  setImage: (file) => {
    if (file) {
      const preview = URL.createObjectURL(file);
      set({ selectedImage: file, imagePreview: preview });
    } else {
      set({ selectedImage: null, imagePreview: null });
    }
  },

  setGender: (gender) => set({ selectedGender: gender }),
  setCharacter: (character) => set({ selectedCharacter: character }),
  setTemplate: (template) => set({ selectedTemplate: template }),
  setJobId: (jobId) => set({ jobId }),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
  setVideoUrl: (url) => set({ videoUrl: url }),

  reset: () => set(initialState),
}));
