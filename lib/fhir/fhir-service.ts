import axios, { AxiosInstance } from "axios";
import {
  FHIRAppointment,
  FHIRBundle,
  FHIRContactPoint,
  FHIRHumanName,
  FHIRPatient,
  FHIRPractitioner,
  FHIRResource,
  FHIRResponse,
  FHIRSearchParams,
} from "../types/fhir";

interface FHIRConfig {
  baseUrl: string;
  clientId?: string;
  clientSecret?: string;
  scope?: string;
  timeout?: number;
}

interface FHIRError {
  response?: {
    data?: {
      issue?: Array<{
        details?: {
          text?: string;
        };
      }>;
    };
    status?: number;
  };
  message?: string;
}

interface FHIRCapabilityStatement extends FHIRResource {
  resourceType: "CapabilityStatement";
  status: string;
  date: string;
  software?: {
    name: string;
    version?: string;
  };
}

interface FHIRConfig {
  baseUrl: string;
  clientId?: string;
  clientSecret?: string;
  scope?: string;
  timeout?: number;
}

export class FHIRService {
  private baseUrl: string;
  private httpClient: AxiosInstance;

  constructor(config: FHIRConfig) {
    this.baseUrl = config.baseUrl;

    // Setup HTTP client for direct API calls
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/fhir+json",
        Accept: "application/fhir+json",
      },
    });

    // Add request interceptor for authentication
    this.httpClient.interceptors.request.use(
      (config) => {
        // Add authentication headers here when available
        // For now, we'll use the endpoint as-is
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("FHIR API Error:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Initialize FHIR service
   */
  async initialize(): Promise<void> {
    try {
      // This would be used for SMART on FHIR authorization
      // For now, we'll work with direct API access
      console.log("FHIR Service initialized for direct API access");
    } catch (error) {
      console.warn("FHIR initialization warning:", error);
    }
  }

  /**
   * Generic method to search FHIR resources
   */
  async search(
    resourceType: string,
    params?: FHIRSearchParams
  ): Promise<FHIRResponse<FHIRBundle>> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach((v) => queryParams.append(key, v));
            } else {
              queryParams.append(key, value);
            }
          }
        });
      }

      const url = `/${resourceType}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await this.httpClient.get(url);

      return {
        data: response.data,
        status: response.status,
        timestamp: new Date(),
      };
    } catch (error: unknown) {
      const fhirError = error as FHIRError;
      return {
        error:
          fhirError.response?.data?.issue?.[0]?.details?.text ||
          fhirError.message ||
          "FHIR API Error",
        status: fhirError.response?.status || 500,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get a specific FHIR resource by ID
   */
  async read<T extends FHIRResource>(
    resourceType: string,
    id: string
  ): Promise<FHIRResponse<T>> {
    try {
      const response = await this.httpClient.get(`/${resourceType}/${id}`);

      return {
        data: response.data,
        status: response.status,
        timestamp: new Date(),
      };
    } catch (error: unknown) {
      const fhirError = error as FHIRError;
      return {
        error:
          fhirError.response?.data?.issue?.[0]?.details?.text ||
          fhirError.message ||
          "Resource not found",
        status: fhirError.response?.status || 404,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Search for patients
   */
  async searchPatients(params?: {
    name?: string;
    identifier?: string;
    birthdate?: string;
    gender?: string;
    _count?: number;
  }): Promise<FHIRResponse<FHIRBundle>> {
    const searchParams: FHIRSearchParams = {};

    if (params?.name) searchParams.name = params.name;
    if (params?.identifier) searchParams.identifier = params.identifier;
    if (params?.birthdate) searchParams.birthdate = params.birthdate;
    if (params?.gender) searchParams.gender = params.gender;
    if (params?._count) searchParams._count = params._count.toString();

    return this.search("Patient", searchParams);
  }

  /**
   * Get patient by ID
   */
  async getPatient(id: string): Promise<FHIRResponse<FHIRPatient>> {
    return this.read<FHIRPatient>("Patient", id);
  }

  /**
   * Search for practitioners/doctors
   */
  async searchPractitioners(params?: {
    name?: string;
    identifier?: string;
    specialty?: string;
    _count?: number;
  }): Promise<FHIRResponse<FHIRBundle>> {
    const searchParams: FHIRSearchParams = {};

    if (params?.name) searchParams.name = params.name;
    if (params?.identifier) searchParams.identifier = params.identifier;
    if (params?.specialty) searchParams.specialty = params.specialty;
    if (params?._count) searchParams._count = params._count.toString();

    return this.search("Practitioner", searchParams);
  }

  /**
   * Get practitioner by ID
   */
  async getPractitioner(id: string): Promise<FHIRResponse<FHIRPractitioner>> {
    return this.read<FHIRPractitioner>("Practitioner", id);
  }

  /**
   * Search for appointments
   */
  async searchAppointments(params?: {
    patient?: string;
    practitioner?: string;
    date?: string;
    status?: string;
    _count?: number;
  }): Promise<FHIRResponse<FHIRBundle>> {
    const searchParams: FHIRSearchParams = {};

    if (params?.patient) searchParams.patient = params.patient;
    if (params?.practitioner) searchParams.practitioner = params.practitioner;
    if (params?.date) searchParams.date = params.date;
    if (params?.status) searchParams.status = params.status;
    if (params?._count) searchParams._count = params._count.toString();

    return this.search("Appointment", searchParams);
  }

  /**
   * Get appointment by ID
   */
  async getAppointment(id: string): Promise<FHIRResponse<FHIRAppointment>> {
    return this.read<FHIRAppointment>("Appointment", id);
  }

  /**
   * Search for schedules
   */
  async searchSchedules(params?: {
    actor?: string;
    date?: string;
    specialty?: string;
    _count?: number;
  }): Promise<FHIRResponse<FHIRBundle>> {
    const searchParams: FHIRSearchParams = {};

    if (params?.actor) searchParams.actor = params.actor;
    if (params?.date) searchParams.date = params.date;
    if (params?.specialty) searchParams.specialty = params.specialty;
    if (params?._count) searchParams._count = params._count.toString();

    return this.search("Schedule", searchParams);
  }

  /**
   * Create or update an appointment status
   */
  async updateAppointmentStatus(
    appointmentId: string,
    status: FHIRAppointment["status"]
  ): Promise<FHIRResponse<FHIRAppointment>> {
    try {
      // First, get the current appointment
      const currentAppointment = await this.getAppointment(appointmentId);

      if (currentAppointment.error) {
        return currentAppointment;
      }

      // Update the status
      const updatedAppointment = {
        ...currentAppointment.data,
        status,
      };

      // PUT the updated appointment
      const response = await this.httpClient.put(
        `/Appointment/${appointmentId}`,
        updatedAppointment
      );

      return {
        data: response.data,
        status: response.status,
        timestamp: new Date(),
      };
    } catch (error: unknown) {
      const fhirError = error as FHIRError;
      return {
        error:
          fhirError.response?.data?.issue?.[0]?.details?.text ||
          fhirError.message ||
          "Update failed",
        status: fhirError.response?.status || 500,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Test connection to FHIR server
   */
  async testConnection(): Promise<FHIRResponse<FHIRCapabilityStatement>> {
    try {
      const response = await this.httpClient.get("/metadata");

      return {
        data: response.data,
        status: response.status,
        timestamp: new Date(),
      };
    } catch (error: unknown) {
      const fhirError = error as FHIRError;
      return {
        error:
          fhirError.response?.data?.issue?.[0]?.details?.text ||
          fhirError.message ||
          "Connection failed",
        status: fhirError.response?.status || 500,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get capability statement (server metadata)
   */
  async getCapabilityStatement(): Promise<
    FHIRResponse<FHIRCapabilityStatement>
  > {
    return this.testConnection();
  }
}

// Default FHIR service instance for eClinicalWorks
export const fhirService = new FHIRService({
  baseUrl: "https://fhir4.eclinicalworks.com/fhir/r4/JFEECD",
  timeout: 30000,
});

// Helper functions for common operations
export const FHIRHelpers = {
  /**
   * Extract human-readable name from FHIR HumanName array
   */
  getDisplayName: (names?: FHIRHumanName[]): string => {
    if (!names || names.length === 0) return "Unknown";

    const officialName = names.find((name) => name.use === "official");
    const usualName = names.find((name) => name.use === "usual");
    const anyName = names[0];

    const nameToUse = officialName || usualName || anyName;

    if (nameToUse.text) return nameToUse.text;

    const parts = [];
    if (nameToUse.prefix) parts.push(...nameToUse.prefix);
    if (nameToUse.given) parts.push(...nameToUse.given);
    if (nameToUse.family) parts.push(nameToUse.family);
    if (nameToUse.suffix) parts.push(...nameToUse.suffix);

    return parts.join(" ") || "Unknown";
  },

  /**
   * Extract phone number from FHIR ContactPoint array
   */
  getPhoneNumber: (telecoms?: FHIRContactPoint[]): string => {
    if (!telecoms) return "";

    const phone =
      telecoms.find((t) => t.system === "phone" && t.use === "work") ||
      telecoms.find((t) => t.system === "phone" && t.use === "home") ||
      telecoms.find((t) => t.system === "phone");

    return phone?.value || "";
  },

  /**
   * Extract email from FHIR ContactPoint array
   */
  getEmail: (telecoms?: FHIRContactPoint[]): string => {
    if (!telecoms) return "";

    const email = telecoms.find((t) => t.system === "email");
    return email?.value || "";
  },

  /**
   * Format FHIR date to readable format
   */
  formatDate: (fhirDate?: string): string => {
    if (!fhirDate) return "";

    try {
      return new Date(fhirDate).toLocaleDateString();
    } catch {
      return fhirDate;
    }
  },

  /**
   * Format FHIR datetime to readable format
   */
  formatDateTime: (fhirDateTime?: string): string => {
    if (!fhirDateTime) return "";

    try {
      return new Date(fhirDateTime).toLocaleString();
    } catch {
      return fhirDateTime;
    }
  },
};
