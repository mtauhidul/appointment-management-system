import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { FHIRHelpers, fhirService } from "../fhir/fhir-service";
import { db } from "../firebase/config";
import { Doctor } from "../types/doctor";
import {
  EnhancedPatient,
  FHIRAppointment,
  FHIRPatient,
  FHIRPractitioner,
} from "../types/fhir";

/**
 * Enhanced data service that integrates FHIR with Firebase
 * This service maintains the existing Firebase structure while adding FHIR capabilities
 */
export class IntegratedDataService {
  /**
   * Sync patient data from FHIR to Firebase
   */
  async syncPatientFromFHIR(
    fhirPatientId: string
  ): Promise<EnhancedPatient | null> {
    try {
      // Fetch patient from FHIR
      const fhirResponse = await fhirService.getPatient(fhirPatientId);

      if (fhirResponse.error || !fhirResponse.data) {
        console.error("Failed to fetch FHIR patient:", fhirResponse.error);
        return null;
      }

      const fhirPatient = fhirResponse.data;

      // Log that we have the FHIR patient data (could be used for validation)
      console.log(
        "Synced FHIR patient:",
        FHIRHelpers.getDisplayName(fhirPatient.name)
      );

      // Create enhanced patient for our system
      const enhancedPatient: EnhancedPatient = {
        id: `fhir-${fhirPatientId}`,
        fhirId: fhirPatientId,
        workflowStatus: "waiting",
        // FHIR data will be fetched when needed
      };

      // Store in Firebase for workflow management
      await setDoc(doc(db, "enhancedPatients", enhancedPatient.id), {
        ...enhancedPatient,
        createdAt: Timestamp.now(),
        lastUpdated: Timestamp.now(),
      });

      return enhancedPatient;
    } catch (error) {
      console.error("Error syncing patient from FHIR:", error);
      return null;
    }
  }

  /**
   * Get patient with both workflow and FHIR data
   */
  async getPatientWithFHIRData(patientId: string): Promise<{
    workflow: EnhancedPatient | null;
    fhir: FHIRPatient | null;
  }> {
    try {
      // Get workflow data from Firebase
      const workflowDoc = await getDoc(doc(db, "enhancedPatients", patientId));
      const workflowData = workflowDoc.exists()
        ? (workflowDoc.data() as EnhancedPatient)
        : null;

      // Get FHIR data if available
      let fhirData: FHIRPatient | null = null;
      if (workflowData?.fhirId) {
        const fhirResponse = await fhirService.getPatient(workflowData.fhirId);
        if (!fhirResponse.error && fhirResponse.data) {
          fhirData = fhirResponse.data;
        }
      }

      return { workflow: workflowData, fhir: fhirData };
    } catch (error) {
      console.error("Error getting patient data:", error);
      return { workflow: null, fhir: null };
    }
  }

  /**
   * Update patient workflow status and sync to FHIR if needed
   */
  async updatePatientWorkflowStatus(
    patientId: string,
    status: string,
    roomId?: string,
    appointmentId?: string
  ): Promise<void> {
    try {
      // Update workflow data in Firebase
      const updateFields = {
        workflowStatus: status,
        lastUpdated: Timestamp.now(),
      };

      if (roomId) {
        Object.assign(updateFields, { currentRoom: roomId });
      }

      if (status === "checked-in") {
        Object.assign(updateFields, { arrivalTime: Timestamp.now() });
      }

      await updateDoc(doc(db, "enhancedPatients", patientId), updateFields);

      // Update FHIR appointment status if applicable
      if (appointmentId && (status === "checked-in" || status === "arrived")) {
        await fhirService.updateAppointmentStatus(appointmentId, "arrived");
      }
    } catch (error) {
      console.error("Error updating patient workflow status:", error);
    }
  }

  /**
   * Sync practitioner/doctor data from FHIR to existing Doctor structure
   */
  async syncPractitionerFromFHIR(
    fhirPractitionerId: string
  ): Promise<Doctor | null> {
    try {
      // Fetch practitioner from FHIR
      const fhirResponse = await fhirService.getPractitioner(
        fhirPractitionerId
      );

      if (fhirResponse.error || !fhirResponse.data) {
        console.error("Failed to fetch FHIR practitioner:", fhirResponse.error);
        return null;
      }

      const fhirPractitioner = fhirResponse.data;

      // Convert FHIR practitioner to our Doctor structure
      const doctor: Doctor = {
        id: `fhir-${fhirPractitionerId}`,
        name: FHIRHelpers.getDisplayName(fhirPractitioner.name),
        specialty: this.extractSpecialty(fhirPractitioner),
        email: FHIRHelpers.getEmail(fhirPractitioner.telecom),
        phone: FHIRHelpers.getPhoneNumber(fhirPractitioner.telecom),
        roomsAssigned: [], // These will be managed by our system
        assistantsAssigned: [], // These will be managed by our system
        patients: [], // These will be managed by our system
        availability: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        },
      };

      // Store in existing doctors collection with FHIR metadata
      await setDoc(doc(db, "doctors", doctor.id), {
        ...doctor,
        fhirId: fhirPractitionerId,
        lastFhirSync: Timestamp.now(),
        fhirSyncStatus: "synced",
        createdAt: Timestamp.now(),
      });

      return doctor;
    } catch (error) {
      console.error("Error syncing practitioner from FHIR:", error);
      return null;
    }
  }

  /**
   * Search for patients in FHIR and optionally sync them
   */
  async searchPatientsInFHIR(searchTerm: string): Promise<FHIRPatient[]> {
    try {
      const response = await fhirService.searchPatients({
        name: searchTerm,
        _count: 10,
      });

      if (response.error || !response.data?.entry) {
        console.error("FHIR patient search failed:", response.error);
        return [];
      }

      return response.data.entry
        .filter((entry) => entry.resource?.resourceType === "Patient")
        .map((entry) => entry.resource as FHIRPatient);
    } catch (error) {
      console.error("Error searching patients in FHIR:", error);
      return [];
    }
  }

  /**
   * Search for practitioners in FHIR
   */
  async searchPractitionersInFHIR(
    searchTerm: string
  ): Promise<FHIRPractitioner[]> {
    try {
      const response = await fhirService.searchPractitioners({
        name: searchTerm,
        _count: 10,
      });

      if (response.error || !response.data?.entry) {
        console.error("FHIR practitioner search failed:", response.error);
        return [];
      }

      return response.data.entry
        .filter((entry) => entry.resource?.resourceType === "Practitioner")
        .map((entry) => entry.resource as FHIRPractitioner);
    } catch (error) {
      console.error("Error searching practitioners in FHIR:", error);
      return [];
    }
  }

  /**
   * Get appointments for a patient from FHIR
   */
  async getPatientAppointments(
    fhirPatientId: string
  ): Promise<FHIRAppointment[]> {
    try {
      const response = await fhirService.searchAppointments({
        patient: `Patient/${fhirPatientId}`,
        _count: 50,
      });

      if (response.error || !response.data?.entry) {
        console.error("FHIR appointment search failed:", response.error);
        return [];
      }

      return response.data.entry
        .filter((entry) => entry.resource?.resourceType === "Appointment")
        .map((entry) => entry.resource as FHIRAppointment);
    } catch (error) {
      console.error("Error getting patient appointments:", error);
      return [];
    }
  }

  /**
   * Test FHIR connection and capabilities
   */
  async testFHIRConnection(): Promise<{
    connected: boolean;
    capabilities?: Record<string, unknown>;
    error?: string;
  }> {
    try {
      const response = await fhirService.testConnection();

      if (response.error) {
        return {
          connected: false,
          error: response.error,
        };
      }

      return {
        connected: true,
        capabilities: response.data as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get all patients with FHIR integration status
   */
  async getEnhancedPatients(): Promise<EnhancedPatient[]> {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "enhancedPatients"),
          orderBy("lastUpdated", "desc")
        )
      );

      return snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as EnhancedPatient[];
    } catch (error) {
      console.error("Error getting enhanced patients:", error);
      return [];
    }
  }

  /**
   * Initialize FHIR integration
   */
  async initializeFHIRIntegration(): Promise<boolean> {
    try {
      await fhirService.initialize();
      const connectionTest = await this.testFHIRConnection();

      if (!connectionTest.connected) {
        console.warn("FHIR connection test failed:", connectionTest.error);
        return false;
      }

      console.log("FHIR integration initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize FHIR integration:", error);
      return false;
    }
  }

  /**
   * Extract specialty from FHIR practitioner qualifications
   */
  private extractSpecialty(practitioner: FHIRPractitioner): string {
    if (practitioner.qualification && practitioner.qualification.length > 0) {
      const specialty =
        practitioner.qualification[0].code?.text ||
        practitioner.qualification[0].code?.coding?.[0]?.display;
      if (specialty) return specialty;
    }

    // Fallback to any coded specialty information
    return "General Practice";
  }
}

// Export singleton instance
export const integratedDataService = new IntegratedDataService();
