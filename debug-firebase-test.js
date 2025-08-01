// Simple Firebase debug script
import { collection, getDocs, query, limit, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './lib/firebase/config.ts';

async function testFirebaseOperations() {
  try {
    console.log('🔥 Testing Firebase operations...');
    
    // Test 1: Check doctors collection
    console.log('\n📋 Checking doctors collection...');
    const doctorsRef = collection(db, 'doctors');
    const doctorsQuery = query(doctorsRef, limit(3));
    const doctorsSnapshot = await getDocs(doctorsQuery);
    
    console.log(`Found ${doctorsSnapshot.size} doctors:`);
    doctorsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- Doctor: ${data.name} (${data.specialty})`);
      console.log(`  Availability:`, data.availability);
    });
    
    // Test 2: Check appointments collection
    console.log('\n📅 Checking appointments collection...');
    const appointmentsRef = collection(db, 'appointments');
    const appointmentsQuery = query(appointmentsRef, limit(5));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    
    console.log(`Found ${appointmentsSnapshot.size} appointments:`);
    appointmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- Appointment: ${data.patientName} with ${data.doctorName}`);
      console.log(`  Date: ${data.date?.toDate?.() || data.date}, Time: ${data.timeSlot}`);
      console.log(`  Status: ${data.status}, Type: ${data.type}`);
    });
    
    // Test 3: Create a test appointment
    console.log('\n✅ Creating test appointment...');
    const testAppointment = {
      patientId: 'test-patient-123',
      patientName: 'Test Patient',
      patientEmail: 'test@example.com',
      patientPhone: '+1-555-0123',
      doctorId: 'test-doctor-123',
      doctorName: 'Dr. Test',
      doctorSpecialty: 'General Practice',
      date: Timestamp.fromDate(new Date('2025-08-15T10:00:00')),
      timeSlot: '10:00 AM',
      duration: 30,
      type: 'in-person',
      location: 'Room 101',
      status: 'scheduled',
      notes: 'Test appointment created by debug script',
      reasonForVisit: 'Testing appointment creation',
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    const docRef = await addDoc(appointmentsRef, testAppointment);
    console.log(`✅ Test appointment created with ID: ${docRef.id}`);
    
    console.log('\n🎉 All Firebase operations completed successfully!');
    
  } catch (error) {
    console.error('❌ Firebase operations failed:', error);
  }
}

// Export for use in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testFirebaseOperations };
} else {
  // Browser environment
  testFirebaseOperations();
}
