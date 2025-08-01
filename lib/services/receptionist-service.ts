import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Receptionist } from '@/lib/types';

/**
 * Real-time Receptionist Service
 * Handles CRUD operations for receptionists with Firestore integration
 */
class RealReceptionistService {
  private unsubscribeReceptionist: (() => void) | null = null;

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
   * Create a new receptionist in Firestore
   */
  async createReceptionist(receptionistData: Omit<Receptionist, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Clean data to remove undefined values
      const cleanedData = this.cleanDataForFirestore(receptionistData);
      
      const docRef = await addDoc(collection(db, 'receptionists'), cleanedData);
      console.log('Receptionist created with ID:', docRef.id);
      
      return {
        success: true,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error creating receptionist:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create receptionist'
      };
    }
  }

  /**
   * Update an existing receptionist in Firestore
   */
  async updateReceptionist(receptionistId: string, updates: Partial<Receptionist>): Promise<{ success: boolean; error?: string }> {
    try {
      const receptionistRef = doc(db, 'receptionists', receptionistId);
      
      // Clean data to remove undefined values and add timestamp
      const cleanedUpdates = this.cleanDataForFirestore({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      await updateDoc(receptionistRef, cleanedUpdates);
      
      console.log('Receptionist updated:', receptionistId);
      return { success: true };
    } catch (error) {
      console.error('Error updating receptionist:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update receptionist'
      };
    }
  }

  /**
   * Delete a receptionist from Firestore
   */
  async deleteReceptionist(receptionistId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const receptionistRef = doc(db, 'receptionists', receptionistId);
      await deleteDoc(receptionistRef);
      
      console.log('Receptionist deleted:', receptionistId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting receptionist:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete receptionist'
      };
    }
  }

  /**
   * Set up real-time listener for receptionists
   */
  setupRealTimeListener(
    onReceptionistsUpdate: (receptionists: Receptionist[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const receptionistsQuery = query(
        collection(db, 'receptionists'),
        orderBy('name', 'asc')
      );

      this.unsubscribeReceptionist = onSnapshot(
        receptionistsQuery,
        (snapshot) => {
          const receptionists: Receptionist[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            receptionists.push({
              id: doc.id,
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || '',
            });
          });

          console.log(`Real-time update: ${receptionists.length} receptionists loaded`);
          onReceptionistsUpdate(receptionists);
        },
        (error) => {
          console.error('Real-time receptionists listener error:', error);
          if (onError) onError(error);
        }
      );

      return this.unsubscribeReceptionist;
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
    if (this.unsubscribeReceptionist) {
      this.unsubscribeReceptionist();
      this.unsubscribeReceptionist = null;
    }
  }
}

// Export singleton instance
const realReceptionistService = new RealReceptionistService();
export default realReceptionistService;
