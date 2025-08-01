import { Assistant } from "@/lib/types";
import { create, StateCreator } from "zustand";

interface AssistantStore {
  assistants: Assistant[];
  isLoading: boolean;
  // Local state management (for real-time updates)
  addAssistant: (assistant: Assistant) => void;
  updateAssistant: (id: string, updates: Partial<Assistant>) => void;
  deleteAssistant: (id: string) => void;
  setAssistants: (assistants: Assistant[]) => void;
  setLoading: (loading: boolean) => void;
  assignDoctorToAssistant: (assistantId: string, doctorId: string) => void;
  removeDoctorFromAssistant: (assistantId: string, doctorId: string) => void;
  // Firestore operations
  addAssistantToFirestore: (assistantData: Omit<Assistant, 'id'>) => Promise<boolean>;
  updateAssistantInFirestore: (id: string, updates: Partial<Assistant>) => Promise<boolean>;
  deleteAssistantFromFirestore: (id: string) => Promise<boolean>;
}

const assistantStore: StateCreator<AssistantStore> = (set) => ({
  assistants: [],
  isLoading: false,

  // ✅ Set assistants (used by real-time listeners)
  setAssistants: (assistants) => set({ assistants }),
  
  // ✅ Set loading state
  setLoading: (isLoading) => set({ isLoading }),

  // ✅ Add a new assistant (local state only)
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

  // 🔥 REAL FIRESTORE OPERATIONS
  
  // ✅ Add assistant to Firestore (this will trigger real-time update)
  addAssistantToFirestore: async (assistantData) => {
    set({ isLoading: true });
    try {
      const assistantService = (await import('@/lib/services/assistant-service')).default;
      const result = await assistantService.createAssistant(assistantData);
      
      if (result.success) {
        console.log('Assistant added to Firestore:', result.id);
        return true;
      } else {
        console.error('Failed to add assistant:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error adding assistant to Firestore:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Update assistant in Firestore (this will trigger real-time update)
  updateAssistantInFirestore: async (id, updates) => {
    try {
      const assistantService = (await import('@/lib/services/assistant-service')).default;
      const result = await assistantService.updateAssistant(id, updates);
      
      if (result.success) {
        console.log('Assistant updated in Firestore:', id);
        return true;
      } else {
        console.error('Failed to update assistant:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating assistant in Firestore:', error);
      return false;
    }
  },

  // ✅ Delete assistant from Firestore (this will trigger real-time update)
  deleteAssistantFromFirestore: async (id) => {
    set({ isLoading: true });
    try {
      const assistantService = (await import('@/lib/services/assistant-service')).default;
      const result = await assistantService.deleteAssistant(id);
      
      if (result.success) {
        console.log('Assistant deleted from Firestore:', id);
        return true;
      } else {
        console.error('Failed to delete assistant:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting assistant from Firestore:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
});

export const useAssistantStore = create<AssistantStore>(assistantStore);
