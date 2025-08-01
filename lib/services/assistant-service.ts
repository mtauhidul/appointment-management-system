import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Assistant } from '@/lib/types/assistant';

/**
 * Real-time Assistant Service
 * Handles CRUD operations for assistants with Firestore integration
 */
class RealAssistantService {
  private unsubscribeAssistant: (() => void) | null = null;

  /**
   * Clean data for Firestore (remove undefined values)
   * Firestore doesn't accept undefined values, only null or omitted fields
   */
  private cleanDataForFirestore<T extends Record<string, unknown>>(data: T): Partial<T> {
    const cleaned: Partial<T> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        (cleaned as Record<string, unknown>)[key] = value;
      }
    }
    return cleaned;
  }

  /**
   * Create a new assistant in Firestore
   */
  async createAssistant(assistantData: Omit<Assistant, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Clean data to remove undefined values
      const cleanedData = this.cleanDataForFirestore(assistantData);
      
      const docRef = await addDoc(collection(db, 'assistants'), cleanedData);
      console.log('Assistant created with ID:', docRef.id);
      
      return {
        success: true,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error creating assistant:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create assistant'
      };
    }
  }

  /**
   * Update an existing assistant in Firestore
   */
  async updateAssistant(assistantId: string, updates: Partial<Assistant>): Promise<{ success: boolean; error?: string }> {
    try {
      const assistantRef = doc(db, 'assistants', assistantId);
      
      // Clean data to remove undefined values and add timestamp
      const cleanedUpdates = this.cleanDataForFirestore({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      await updateDoc(assistantRef, cleanedUpdates);
      
      console.log('Assistant updated:', assistantId);
      return { success: true };
    } catch (error) {
      console.error('Error updating assistant:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update assistant'
      };
    }
  }

  /**
   * Delete an assistant from Firestore
   */
  async deleteAssistant(assistantId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const assistantRef = doc(db, 'assistants', assistantId);
      await deleteDoc(assistantRef);
      
      console.log('Assistant deleted:', assistantId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting assistant:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete assistant'
      };
    }
  }

  /**
   * Set up real-time listener for assistants
   */
  setupRealTimeListener(
    onAssistantsUpdate: (assistants: Assistant[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const assistantsQuery = query(
        collection(db, 'assistants'),
        orderBy('name', 'asc')
      );

      this.unsubscribeAssistant = onSnapshot(
        assistantsQuery,
        (snapshot) => {
          const assistants: Assistant[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            assistants.push({
              id: doc.id,
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || '',
              doctorsAssigned: data.doctorsAssigned || [],
            });
          });

          console.log(`Real-time update: ${assistants.length} assistants loaded`);
          onAssistantsUpdate(assistants);
        },
        (error) => {
          console.error('Real-time assistants listener error:', error);
          if (onError) onError(error);
        }
      );

      return this.unsubscribeAssistant;
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
      if (onError && error instanceof Error) onError(error);
      return () => {};
    }
  }

  /**
   * Cleanup real-time listener
   */
  cleanup(): void {
    if (this.unsubscribeAssistant) {
      this.unsubscribeAssistant();
      this.unsubscribeAssistant = null;
    }
  }
}

// Export singleton instance
const realAssistantService = new RealAssistantService();
export default realAssistantService;
