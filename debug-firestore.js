// Simple Firestore connection test
import { collection, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase/config.ts';

async function testFirestoreConnection() {
  try {
    console.log('🔍 Testing Firestore connection...');
    
    // Test doctors collection
    const doctorsRef = collection(db, 'doctors');
    const doctorsSnapshot = await getDocs(doctorsRef);
    console.log(`📊 Doctors collection: ${doctorsSnapshot.size} documents`);
    
    doctorsSnapshot.forEach((doc) => {
      console.log('👨‍⚕️ Doctor:', doc.id, doc.data());
    });
    
    // Test rooms collection
    const roomsRef = collection(db, 'rooms');
    const roomsSnapshot = await getDocs(roomsRef);
    console.log(`🏠 Rooms collection: ${roomsSnapshot.size} documents`);
    
    roomsSnapshot.forEach((doc) => {
      console.log('🏠 Room:', doc.id, doc.data());
    });
    
  } catch (error) {
    console.error('❌ Firestore connection error:', error);
  }
}

// Run the test
testFirestoreConnection();
