import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Room } from '@/lib/types/room';

/**
 * Real-time Room Service
 * Handles CRUD operations for rooms with Firestore integration
 * This service ensures that all room operations are synchronized with Firebase
 */
class RealRoomService {
  private unsubscribeRoom: (() => void) | null = null;

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
   * Create a new room in Firestore
   */
  async createRoom(roomData: Omit<Room, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Clean data to remove undefined values
      const cleanedData = this.cleanDataForFirestore(roomData);
      
      const docRef = await addDoc(collection(db, 'rooms'), cleanedData);
      console.log('Room created with ID:', docRef.id);
      
      return {
        success: true,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error creating room:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create room'
      };
    }
  }

  /**
   * Update an existing room in Firestore
   */
  async updateRoom(roomId: string, updates: Partial<Room>): Promise<{ success: boolean; error?: string }> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      
      // Clean data to remove undefined values and add timestamp
      const cleanedUpdates = this.cleanDataForFirestore({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      await updateDoc(roomRef, cleanedUpdates);
      
      console.log('Room updated:', roomId);
      return { success: true };
    } catch (error) {
      console.error('Error updating room:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update room'
      };
    }
  }

  /**
   * Delete a room from Firestore
   */
  async deleteRoom(roomId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await deleteDoc(roomRef);
      
      console.log('Room deleted:', roomId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting room:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete room'
      };
    }
  }

  /**
   * Set up real-time listener for rooms
   * This will automatically update the local store when Firestore data changes
   */
  setupRealTimeListener(
    onRoomsUpdate: (rooms: Room[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const roomsQuery = query(
        collection(db, 'rooms'),
        orderBy('number', 'asc')
      );

      this.unsubscribeRoom = onSnapshot(
        roomsQuery,
        (snapshot) => {
          const rooms: Room[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            rooms.push({
              id: doc.id,
              number: data.number || 0,
              doctorsAssigned: data.doctorsAssigned || [],
              patientAssigned: data.patientAssigned,
              doctorStatuses: data.doctorStatuses || {},
              isEmergency: data.isEmergency || false,
            });
          });

          console.log(`Real-time update: ${rooms.length} rooms loaded`);
          onRoomsUpdate(rooms);
        },
        (error) => {
          console.error('Real-time rooms listener error:', error);
          if (onError) onError(error);
        }
      );

      return this.unsubscribeRoom;
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
    if (this.unsubscribeRoom) {
      this.unsubscribeRoom();
      this.unsubscribeRoom = null;
    }
  }
}

// Export singleton instance
const realRoomService = new RealRoomService();
export default realRoomService;
