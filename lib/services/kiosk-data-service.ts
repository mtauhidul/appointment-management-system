import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import medicalDataService from '@/lib/services/medical-data-service';
import { PatientCheckInData } from '@/lib/types/kiosk';

/**
 * Real Kiosk Data Service
 * Integrates kiosk system with real Firestore data, replacing all hardcoded arrays
 */

export interface KioskPatientData extends PatientCheckInData {
  id?: string;
  submittedAt?: string;
  status?: 'submitted' | 'processing' | 'completed' | 'error';
  encounterId?: string;
}

class RealKioskDataService {
  
  /**
   * Get real medical conditions to replace hardcoded COMMON_CONDITIONS
   */
  async getMedicalConditions(): Promise<string[]> {
    try {
      const conditions = await medicalDataService.getMedicalConditions();
      return conditions
        .filter((condition: { isActive: boolean }) => condition.isActive)
        .map((condition: { name: string }) => condition.name)
        .slice(0, 50);
    } catch (error) {
      console.error('Error fetching medical conditions:', error);
      return [];
    }
  }

  /**
   * Get all allergies from medical database
   */
  async getAllergies(): Promise<string[]> {
    try {
      const allergies = await medicalDataService.getAllergies();
      return allergies.slice(0, 50);
    } catch (error) {
      console.error('Error fetching allergies:', error);
      return [];
    }
  }

  /**
   * Get all medications from medical database
   */
  async getMedications(): Promise<string[]> {
    try {
      const medications = await medicalDataService.getMedications();
      return medications.slice(0, 100);
    } catch (error) {
      console.error('Error fetching medications:', error);
      return [];
    }
  }

  /**
   * Get real medical procedures to replace hardcoded procedure lists
   */
  async getProcedures(): Promise<string[]> {
    try {
      // For now, return static list since our simplified service doesn't have procedures
      return [
        'Appendectomy',
        'Gallbladder Surgery',
        'Hernia Repair',
        'Cataract Surgery',
        'Knee Replacement',
        'Hip Replacement',
        'Colonoscopy',
        'Endoscopy',
        'Biopsy',
        'Arthroscopy'
      ];
    } catch (error) {
      console.error('Error fetching procedures:', error);
      return this.getFallbackProcedures();
    }
  }

  /**
   * Get US states for demographics - real data to replace hardcoded states
   */
  async getUSStates(): Promise<{ code: string; name: string }[]> {
    try {
      // This would normally come from a database, but for now we'll use static data
      return [
        { code: 'AL', name: 'Alabama' },
        { code: 'AK', name: 'Alaska' },
        { code: 'AZ', name: 'Arizona' },
        { code: 'AR', name: 'Arkansas' },
        { code: 'CA', name: 'California' },
        { code: 'CO', name: 'Colorado' },
        { code: 'CT', name: 'Connecticut' },
        { code: 'DE', name: 'Delaware' },
        { code: 'FL', name: 'Florida' },
        { code: 'GA', name: 'Georgia' },
        { code: 'HI', name: 'Hawaii' },
        { code: 'ID', name: 'Idaho' },
        { code: 'IL', name: 'Illinois' },
        { code: 'IN', name: 'Indiana' },
        { code: 'IA', name: 'Iowa' },
        { code: 'KS', name: 'Kansas' },
        { code: 'KY', name: 'Kentucky' },
        { code: 'LA', name: 'Louisiana' },
        { code: 'ME', name: 'Maine' },
        { code: 'MD', name: 'Maryland' },
        { code: 'MA', name: 'Massachusetts' },
        { code: 'MI', name: 'Michigan' },
        { code: 'MN', name: 'Minnesota' },
        { code: 'MS', name: 'Mississippi' },
        { code: 'MO', name: 'Missouri' },
        { code: 'MT', name: 'Montana' },
        { code: 'NE', name: 'Nebraska' },
        { code: 'NV', name: 'Nevada' },
        { code: 'NH', name: 'New Hampshire' },
        { code: 'NJ', name: 'New Jersey' },
        { code: 'NM', name: 'New Mexico' },
        { code: 'NY', name: 'New York' },
        { code: 'NC', name: 'North Carolina' },
        { code: 'ND', name: 'North Dakota' },
        { code: 'OH', name: 'Ohio' },
        { code: 'OK', name: 'Oklahoma' },
        { code: 'OR', name: 'Oregon' },
        { code: 'PA', name: 'Pennsylvania' },
        { code: 'RI', name: 'Rhode Island' },
        { code: 'SC', name: 'South Carolina' },
        { code: 'SD', name: 'South Dakota' },
        { code: 'TN', name: 'Tennessee' },
        { code: 'TX', name: 'Texas' },
        { code: 'UT', name: 'Utah' },
        { code: 'VT', name: 'Vermont' },
        { code: 'VA', name: 'Virginia' },
        { code: 'WA', name: 'Washington' },
        { code: 'WV', name: 'West Virginia' },
        { code: 'WI', name: 'Wisconsin' },
        { code: 'WY', name: 'Wyoming' }
      ];
    } catch (error) {
      console.error('Error fetching US states:', error);
      return [{ code: 'CA', name: 'California' }]; // Fallback
    }
  }

  /**
   * Submit patient check-in data to Firestore
   */
  async submitPatientCheckIn(patientData: PatientCheckInData): Promise<{ success: boolean; patientId?: string; encounterId?: string; error?: string }> {
    try {
      const kioskData: KioskPatientData = {
        ...patientData,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };

      const docRef = await addDoc(collection(db, 'kiosk-check-ins'), kioskData);
      console.log('Patient check-in submitted with ID:', docRef.id);
      
      return {
        success: true,
        patientId: docRef.id,
        encounterId: docRef.id // Using the same ID as encounter for now
      };
    } catch (error) {
      console.error('Error submitting patient check-in:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit patient check-in data'
      };
    }
  }

  /**
   * Get patient check-ins by status
   */
  async getPatientCheckInsByStatus(status: string): Promise<KioskPatientData[]> {
    try {
      const q = query(
        collection(db, 'kiosk-check-ins'),
        where('status', '==', status)
      );
      
      const querySnapshot = await getDocs(q);
      const checkIns: KioskPatientData[] = [];
      
      querySnapshot.forEach((doc) => {
        checkIns.push({
          id: doc.id,
          ...doc.data()
        } as KioskPatientData);
      });

      return checkIns;
    } catch (error) {
      console.error('Error fetching patient check-ins:', error);
      return [];
    }
  }

  /**
   * Update patient check-in status
   */
  async updatePatientCheckInStatus(checkInId: string, status: string): Promise<boolean> {
    try {
      const checkInRef = doc(db, 'kiosk-check-ins', checkInId);
      await updateDoc(checkInRef, { status, updatedAt: new Date().toISOString() });
      return true;
    } catch (error) {
      console.error('Error updating patient check-in status:', error);
      return false;
    }
  }

  // Fallback methods for when real data fails to load
  private getFallbackConditions(): string[] {
    return [
      'Diabetes',
      'High Blood Pressure',
      'Heart Disease',
      'Asthma',
      'Arthritis',
      'Depression',
      'Anxiety',
      'High Cholesterol',
      'Migraine',
      'COPD'
    ];
  }

  private getFallbackAllergies(): string[] {
    return [
      'Penicillin',
      'Peanuts',
      'Shellfish',
      'Latex',
      'Dust Mites',
      'Pollen',
      'Pet Dander',
      'Eggs',
      'Milk',
      'Soy'
    ];
  }

  private getFallbackMedications(): string[] {
    return [
      'Aspirin',
      'Ibuprofen',
      'Acetaminophen',
      'Metformin',
      'Lisinopril',
      'Atorvastatin',
      'Metoprolol',
      'Amlodipine',
      'Omeprazole',
      'Levothyroxine'
    ];
  }

  private getFallbackProcedures(): string[] {
    return [
      'Appendectomy',
      'Gallbladder Surgery',
      'Hernia Repair',
      'Cataract Surgery',
      'Knee Replacement'
    ];
  }
}

// Export singleton instance
const realKioskDataService = new RealKioskDataService();
export default realKioskDataService;
