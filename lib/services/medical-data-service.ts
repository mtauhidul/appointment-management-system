/**
 * Real Medical Data Service
 * Simplified version providing medical data for forms
 */
class RealMedicalDataService {
  /**
   * Get medical conditions for patient forms
   */
  async getMedicalConditions(): Promise<Array<{ id: string; name: string; category: string; isActive: boolean }>> {
    // Return static data for now - can be enhanced with Firestore later
    return [
      { id: '1', name: 'Diabetes Type 1', category: 'chronic', isActive: true },
      { id: '2', name: 'Diabetes Type 2', category: 'chronic', isActive: true },
      { id: '3', name: 'Hypertension', category: 'chronic', isActive: true },
      { id: '4', name: 'High Cholesterol', category: 'chronic', isActive: true },
      { id: '5', name: 'Asthma', category: 'chronic', isActive: true },
      { id: '6', name: 'COPD', category: 'chronic', isActive: true },
      { id: '7', name: 'Heart Disease', category: 'chronic', isActive: true },
      { id: '8', name: 'Arthritis', category: 'chronic', isActive: true },
      { id: '9', name: 'Depression', category: 'mental_health', isActive: true },
      { id: '10', name: 'Anxiety', category: 'mental_health', isActive: true },
      { id: '11', name: 'Migraine', category: 'chronic', isActive: true },
      { id: '12', name: 'Epilepsy', category: 'chronic', isActive: true },
      { id: '13', name: 'Thyroid Disorder', category: 'chronic', isActive: true },
      { id: '14', name: 'Kidney Disease', category: 'chronic', isActive: true },
      { id: '15', name: 'Cancer', category: 'other', isActive: true }
    ];
  }

  /**
   * Get medications for patient forms
   */
  async getMedications(): Promise<string[]> {
    return [
      'Acetaminophen (Tylenol)',
      'Ibuprofen (Advil, Motrin)',
      'Aspirin',
      'Metformin',
      'Lisinopril',
      'Atorvastatin (Lipitor)',
      'Omeprazole (Prilosec)',
      'Levothyroxine (Synthroid)',
      'Amlodipine',
      'Metoprolol',
      'Hydrochlorothiazide',
      'Simvastatin',
      'Losartan',
      'Gabapentin',
      'Sertraline (Zoloft)',
      'Fluoxetine (Prozac)',
      'Escitalopram (Lexapro)',
      'Alprazolam (Xanax)',
      'Lorazepam (Ativan)',
      'Trazodone'
    ];
  }

  /**
   * Get allergies for patient forms
   */
  async getAllergies(): Promise<string[]> {
    return [
      'Penicillin',
      'Peanuts',
      'Shellfish',
      'Latex',
      'Pollen',
      'Dust Mites',
      'Eggs',
      'Milk',
      'Aspirin',
      'Iodine',
      'Sulfa drugs',
      'Codeine',
      'Tree nuts',
      'Soy',
      'Wheat/Gluten',
      'Pet dander',
      'Mold',
      'Bee stings',
      'Fragrances'
    ];
  }

  /**
   * Initialize seed data (placeholder for future implementation)
   */
  async initializeSeedData(): Promise<void> {
    console.log('Medical data service initialized with static data');
  }
}

// Create singleton instance
export const realMedicalDataService = new RealMedicalDataService();
export default realMedicalDataService;