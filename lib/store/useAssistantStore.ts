import { Assistant } from "@/lib/types";
import { create, StateCreator } from "zustand";
interface AssistantStore {
  assistants: Assistant[];
  addAssistant: (assistant: Assistant) => void;
  updateAssistant: (id: string, updates: Partial<Assistant>) => void;
  deleteAssistant: (id: string) => void;
  assignDoctorToAssistant: (assistantId: string, doctorId: string) => void;
  removeDoctorFromAssistant: (assistantId: string, doctorId: string) => void;
}

const assistantStore: StateCreator<AssistantStore> = (set) => ({
  assistants: [],

  addAssistant: (assistant: Assistant) =>
    set((state) => ({ assistants: [...state.assistants, assistant] })),

  updateAssistant: (id: string, updates: Partial<Assistant>) =>
    set((state) => ({
      assistants: state.assistants.map((assistant) =>
        assistant.id === id ? { ...assistant, ...updates } : assistant
      ),
    })),

  deleteAssistant: (id: string) =>
    set((state) => ({
      assistants: state.assistants.filter((assistant) => assistant.id !== id),
    })),

  assignDoctorToAssistant: (assistantId, doctorId) =>
    set((state) => ({
      assistants: state.assistants.map((assistant) =>
        assistant.id === assistantId
          ? {
              ...assistant,
              doctorsAssigned: Array.from(
                new Set([...(assistant.doctorsAssigned || []), doctorId]) // ✅ Ensure no duplicates
              ),
            }
          : assistant
      ),
    })),

  removeDoctorFromAssistant: (assistantId, doctorId) =>
    set((state) => ({
      assistants: state.assistants.map((assistant) =>
        assistant.id === assistantId
          ? {
              ...assistant,
              doctorsAssigned: assistant.doctorsAssigned.filter(
                (id) => id !== doctorId
              ),
            }
          : assistant
      ),
    })),
});

export const useAssistantStore = create<AssistantStore>(assistantStore);
