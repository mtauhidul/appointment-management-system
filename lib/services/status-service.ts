import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Status } from '@/lib/types/status';

/**
 * Real-time Status Service
 * Handles CRUD operations for statuses with Firestore integration
 * This service ensures that all status operations are synchronized with Firebase
 */
class RealStatusService {
  private unsubscribeStatus: (() => void) | null = null;

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
   * Create a new status in Firestore
   */
  async createStatus(statusData: Omit<Status, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Clean data to remove undefined values
      const cleanedData = this.cleanDataForFirestore({
        ...statusData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      const docRef = await addDoc(collection(db, 'statuses'), cleanedData);
      console.log('Status created with ID:', docRef.id);
      
      return {
        success: true,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error creating status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create status'
      };
    }
  }

  /**
   * Update an existing status in Firestore
   */
  async updateStatus(statusId: string, updates: Partial<Status>): Promise<{ success: boolean; error?: string }> {
    try {
      const statusRef = doc(db, 'statuses', statusId);
      
      // Clean data to remove undefined values and add timestamp
      const cleanedUpdates = this.cleanDataForFirestore({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      await updateDoc(statusRef, cleanedUpdates);
      
      console.log('Status updated:', statusId);
      return { success: true };
    } catch (error) {
      console.error('Error updating status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update status'
      };
    }
  }

  /**
   * Delete a status from Firestore
   */
  async deleteStatus(statusId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const statusRef = doc(db, 'statuses', statusId);
      await deleteDoc(statusRef);
      
      console.log('Status deleted:', statusId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete status'
      };
    }
  }

  /**
   * Set up real-time listener for statuses
   * This will automatically update the local store when Firestore data changes
   */
  setupRealTimeListener(
    onStatusesUpdate: (statuses: Status[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const statusesQuery = query(
        collection(db, 'statuses'),
        orderBy('name', 'asc')
      );

      this.unsubscribeStatus = onSnapshot(
        statusesQuery,
        (snapshot) => {
          const statuses: Status[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            statuses.push({
              id: doc.id,
              name: data.name || '',
              color: data.color || '#000000',
              activityType: data.activityType || 'general',
              hasSound: data.hasSound || false,
            });
          });

          console.log(`Real-time update: ${statuses.length} statuses loaded`);
          onStatusesUpdate(statuses);
        },
        (error) => {
          console.error('Real-time statuses listener error:', error);
          if (onError) onError(error);
        }
      );

      return this.unsubscribeStatus;
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
    if (this.unsubscribeStatus) {
      this.unsubscribeStatus();
      this.unsubscribeStatus = null;
    }
  }
}

// Export singleton instance
const realStatusService = new RealStatusService();
export default realStatusService;
