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

  // ✅ Add a new assistant
  addAssistant: (assistant: Assistant) =>
    set((state) => ({ assistants: [...state.assistants, assistant] })),

  // ✅ Update assistant details
  updateAssistant: (id: string, updates: Partial<Assistant>) =>
    set((state) => ({
      assistants: state.assistants.map((assistant) =>
        assistant.id === id ? { ...assistant, ...updates } : assistant
      ),
    })),

  // ✅ Delete an assistant
  deleteAssistant: (id: string) =>
    set((state) => ({
      assistants: state.assistants.filter((assistant) => assistant.id !== id),
    })),

  // ✅ Assign a doctor to an assistant (Only using IDs)
  assignDoctorToAssistant: (assistantId, doctorId) =>
    set((state) => ({
      assistants: state.assistants.map((assistant) =>
        assistant.id === assistantId
          ? {
              ...assistant,
              doctorsAssigned: Array.from(
                new Set([...(assistant.doctorsAssigned || []), doctorId]) // Ensures no duplicates
              ),
            }
          : assistant
      ),
    })),

  // ✅ Remove a doctor from an assistant (Only using IDs)
  removeDoctorFromAssistant: (assistantId, doctorId) =>
    set((state) => ({
      assistants: state.assistants.map((assistant) =>
        assistant.id === assistantId
          ? {
              ...assistant,
              doctorsAssigned:
                assistant.doctorsAssigned?.filter((id) => id !== doctorId) ||
                [],
            }
          : assistant
      ),
    })),
});

export const useAssistantStore = create<AssistantStore>(assistantStore);
