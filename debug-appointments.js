const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

// Firebase config (you might need to update this)
const firebaseConfig = {
  // Add your Firebase config here
  // For debugging purposes, you can temporarily add it here
};

async function debugFirestore() {
  try {
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('📋 Checking appointments collection...');
    const appointmentsRef = collection(db, 'appointments');
    const appointmentsQuery = query(appointmentsRef, limit(5));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    
    console.log(`Found ${appointmentsSnapshot.size} appointments:`);
    appointmentsSnapshot.forEach((doc) => {
      console.log('- Appointment ID:', doc.id);
      console.log('  Data:', doc.data());
      console.log('---');
    });
    
    console.log('👨‍⚕️ Checking doctors collection...');
    const doctorsRef = collection(db, 'doctors');
    const doctorsQuery = query(doctorsRef, limit(5));
    const doctorsSnapshot = await getDocs(doctorsQuery);
    
    console.log(`Found ${doctorsSnapshot.size} doctors:`);
    doctorsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('- Doctor ID:', doc.id);
      console.log('  Name:', data.name);
      console.log('  Specialty:', data.specialty);
      console.log('  Availability:', data.availability);
      console.log('---');
    });
    
    console.log('✅ Firebase connection successful!');
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
  }
}

debugFirestore();
