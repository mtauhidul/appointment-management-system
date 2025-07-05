import { useCallback, useEffect, useState } from "react";
import { integratedDataService } from "../lib/services/integrated-data-service";
import {
  EnhancedPatient,
  FHIRPatient,
  FHIRPractitioner,
} from "../lib/types/fhir";

/**
 * Custom hook for FHIR integration
 */
export const useFHIRIntegration = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize FHIR connection on mount
  useEffect(() => {
    const initializeFHIR = async () => {
      try {
        setIsLoading(true);
        const success = await integratedDataService.initializeFHIRIntegration();
        setIsConnected(success);

        if (!success) {
          setError("Failed to connect to FHIR server");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "FHIR initialization failed"
        );
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeFHIR();
  }, []);

  const testConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await integratedDataService.testFHIRConnection();
      setIsConnected(result.connected);

      if (!result.connected) {
        setError(result.error || "Connection test failed");
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Connection test failed";
      setError(errorMessage);
      setIsConnected(false);
      return { connected: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    testConnection,
  };
};

/**
 * Hook for patient search and management
 */
export const useFHIRPatients = () => {
  const [patients, setPatients] = useState<FHIRPatient[]>([]);
  const [enhancedPatients, setEnhancedPatients] = useState<EnhancedPatient[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchPatients = useCallback(async (searchTerm: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const results = await integratedDataService.searchPatientsInFHIR(
        searchTerm
      );
      setPatients(results);

      return results;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Patient search failed";
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncPatient = useCallback(async (fhirPatientId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const synced = await integratedDataService.syncPatientFromFHIR(
        fhirPatientId
      );

      if (synced) {
        // Refresh enhanced patients list
        const updated = await integratedDataService.getEnhancedPatients();
        setEnhancedPatients(updated);
      }

      return synced;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Patient sync failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePatientStatus = useCallback(
    async (
      patientId: string,
      status: string,
      roomId?: string,
      appointmentId?: string
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        await integratedDataService.updatePatientWorkflowStatus(
          patientId,
          status,
          roomId,
          appointmentId
        );

        // Refresh enhanced patients list
        const updated = await integratedDataService.getEnhancedPatients();
        setEnhancedPatients(updated);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Status update failed";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loadEnhancedPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const results = await integratedDataService.getEnhancedPatients();
      setEnhancedPatients(results);

      return results;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load patients";
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    patients,
    enhancedPatients,
    isLoading,
    error,
    searchPatients,
    syncPatient,
    updatePatientStatus,
    loadEnhancedPatients,
  };
};

/**
 * Hook for practitioner/doctor search and management
 */
export const useFHIRPractitioners = () => {
  const [practitioners, setPractitioners] = useState<FHIRPractitioner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchPractitioners = useCallback(async (searchTerm: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const results = await integratedDataService.searchPractitionersInFHIR(
        searchTerm
      );
      setPractitioners(results);

      return results;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Practitioner search failed";
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncPractitioner = useCallback(async (fhirPractitionerId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const synced = await integratedDataService.syncPractitionerFromFHIR(
        fhirPractitionerId
      );

      return synced;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Practitioner sync failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    practitioners,
    isLoading,
    error,
    searchPractitioners,
    syncPractitioner,
  };
};

/**
 * Hook for patient details with FHIR data
 */
export const usePatientWithFHIR = (patientId: string | null) => {
  const [patientData, setPatientData] = useState<{
    workflow: EnhancedPatient | null;
    fhir: FHIRPatient | null;
  }>({ workflow: null, fhir: null });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadPatientData = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await integratedDataService.getPatientWithFHIRData(id);
      setPatientData(data);

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load patient data";
      setError(errorMessage);
      return { workflow: null, fhir: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (patientId) {
      loadPatientData(patientId);
    } else {
      setPatientData({ workflow: null, fhir: null });
    }
  }, [patientId, loadPatientData]);

  return {
    patientData,
    isLoading,
    error,
    refreshPatientData: patientId
      ? () => loadPatientData(patientId)
      : undefined,
  };
};
