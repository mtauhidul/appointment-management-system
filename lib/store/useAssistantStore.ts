import { create, StateCreator } from "zustand";

interface Assistant {
  id: string;
  name: string;
  email: string;
  phone: string;
  doctorsAssigned: string[];
  specialty?: string;
}

interface AssistantStore {
  assistants: Assistant[];
  addAssistant: (assistant: Assistant) => void;
  updateAssistant: (id: string, updates: Partial<Assistant>) => void;
  deleteAssistant: (id: string) => void;
  assignDoctorToAssistant: (assistantId: string, doctorName: string) => void;
  removeDoctorFromAssistant: (assistantId: string, doctorName: string) => void;
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

  assignDoctorToAssistant: (assistantId: string, doctorName: string) =>
    set((state) => ({
      assistants: state.assistants.map((assistant) =>
        assistant.id === assistantId &&
        !assistant.doctorsAssigned.includes(doctorName)
          ? {
              ...assistant,
              doctorsAssigned: [...assistant.doctorsAssigned, doctorName],
            }
          : assistant
      ),
    })),

  removeDoctorFromAssistant: (assistantId: string, doctorName: string) =>
    set((state) => ({
      assistants: state.assistants.map((assistant) =>
        assistant.id === assistantId
          ? {
              ...assistant,
              doctorsAssigned: assistant.doctorsAssigned.filter(
                (doc) => doc !== doctorName
              ),
            }
          : assistant
      ),
    })),
});

export const useAssistantStore = create<AssistantStore>(assistantStore);
