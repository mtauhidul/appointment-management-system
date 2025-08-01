import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

/**
 * Real FHIR Service that connects to actual FHIR server or Firestore FHIR collections
 * This replaces all mock FHIR data with real API calls
 */

export interface FHIRResource {
  resourceType: string;
  id: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
  text?: {
    status: string;
    div: string;
  };
  [key: string]: unknown;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'searchset' | 'collection' | 'document';
  total?: number;
  entry?: Array<{
    resource: FHIRResource;
    search?: {
      mode: 'match' | 'include';
      score?: number;
    };
  }>;
}

export interface FHIRSearchParams {
  resourceType: string;
  params?: Record<string, string>;
  count?: number;
  offset?: number;
}

export interface FHIRSyncStatus {
  lastSync: string;
  totalPatients: number;
  totalPractitioners: number;
  totalObservations: number;
  totalEncounters: number;
  errors: number;
  warnings: number;
  status: 'syncing' | 'complete' | 'error' | 'idle';
}

class RealFHIRService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    // Configure based on environment variables or default to Firestore
    this.baseUrl = process.env.NEXT_PUBLIC_FHIR_SERVER_URL || 'firestore';
    this.apiKey = process.env.NEXT_PUBLIC_FHIR_API_KEY;
  }

  /**
   * Search for FHIR resources
   */
  async searchResources(searchParams: FHIRSearchParams): Promise<FHIRBundle> {
    try {
      if (this.baseUrl === 'firestore') {
        return await this.searchFirestoreResources(searchParams);
      } else {
        return await this.searchFHIRServer(searchParams);
      }
    } catch (error) {
      console.error('Error searching FHIR resources:', error);
      throw error;
    }
  }

  /**
   * Search FHIR resources in Firestore
   */
  private async searchFirestoreResources(searchParams: FHIRSearchParams): Promise<FHIRBundle> {
    const { resourceType, params, count = 20 } = searchParams;
    
    try {
      // Build Firestore query
      let firestoreQuery = query(
        collection(db, `fhir_${resourceType.toLowerCase()}`),
        orderBy('meta.lastUpdated', 'desc')
      );

      // Apply search parameters as Firestore filters
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            firestoreQuery = query(firestoreQuery, where(key, '==', value));
          }
        });
      }

      // Apply pagination
      firestoreQuery = query(firestoreQuery, limit(count));
      
      // Execute query
      const snapshot = await getDocs(firestoreQuery);
      
      // Convert to FHIR Bundle
      const entries = snapshot.docs.map(doc => ({
        resource: {
          resourceType,
          id: doc.id,
          ...doc.data(),
        } as FHIRResource,
        search: {
          mode: 'match' as const,
        },
      }));

      return {
        resourceType: 'Bundle',
        id: `search-${Date.now()}`,
        type: 'searchset',
        total: entries.length,
        entry: entries,
      };
    } catch (error) {
      console.error('Error searching Firestore FHIR resources:', error);
      throw error;
    }
  }

  /**
   * Search FHIR resources from external FHIR server
   */
  private async searchFHIRServer(searchParams: FHIRSearchParams): Promise<FHIRBundle> {
    const { resourceType, params, count = 20, offset = 0 } = searchParams;
    
    try {
      // Build FHIR search URL
      const searchUrl = new URL(`${this.baseUrl}/${resourceType}`);
      
      // Add search parameters
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            searchUrl.searchParams.append(key, value);
          }
        });
      }
      
      // Add pagination
      searchUrl.searchParams.append('_count', count.toString());
      if (offset > 0) {
        searchUrl.searchParams.append('_offset', offset.toString());
      }

      // Make API request
      const headers: Record<string, string> = {
        'Accept': 'application/fhir+json',
        'Content-Type': 'application/fhir+json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(searchUrl.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`FHIR API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching FHIR server:', error);
      throw error;
    }
  }

  /**
   * Get a specific FHIR resource by ID
   */
  async getResource(resourceType: string, id: string): Promise<FHIRResource> {
    try {
      if (this.baseUrl === 'firestore') {
        return await this.getFirestoreResource(resourceType, id);
      } else {
        return await this.getFHIRServerResource(resourceType, id);
      }
    } catch (error) {
      console.error('Error getting FHIR resource:', error);
      throw error;
    }
  }

  /**
   * Get FHIR resource from Firestore
   */
  private async getFirestoreResource(resourceType: string, id: string): Promise<FHIRResource> {
    try {
      const docRef = collection(db, `fhir_${resourceType.toLowerCase()}`);
      const snapshot = await getDocs(query(docRef, where('id', '==', id), limit(1)));
      
      if (snapshot.empty) {
        throw new Error(`${resourceType}/${id} not found`);
      }

      const doc = snapshot.docs[0];
      return {
        resourceType,
        id: doc.id,
        ...doc.data(),
      } as FHIRResource;
    } catch (error) {
      console.error('Error getting Firestore FHIR resource:', error);
      throw error;
    }
  }

  /**
   * Get FHIR resource from external server
   */
  private async getFHIRServerResource(resourceType: string, id: string): Promise<FHIRResource> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/fhir+json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/${resourceType}/${id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`${resourceType}/${id} not found`);
        }
        throw new Error(`FHIR API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting FHIR server resource:', error);
      throw error;
    }
  }

  /**
   * Get real FHIR sync status
   */
  async getSyncStatus(): Promise<FHIRSyncStatus> {
    try {
      if (this.baseUrl === 'firestore') {
        return await this.getFirestoreSyncStatus();
      } else {
        return await this.getFHIRServerSyncStatus();
      }
    } catch (error) {
      console.error('Error getting FHIR sync status:', error);
      // Return default status on error
      return {
        lastSync: new Date().toISOString(),
        totalPatients: 0,
        totalPractitioners: 0,
        totalObservations: 0,
        totalEncounters: 0,
        errors: 1,
        warnings: 0,
        status: 'error',
      };
    }
  }

  /**
   * Get sync status from Firestore collections
   */
  private async getFirestoreSyncStatus(): Promise<FHIRSyncStatus> {
    try {
      // Count documents in each FHIR collection
      const [patientsSnap, practitionersSnap, observationsSnap, encountersSnap] = await Promise.all([
        getDocs(collection(db, 'fhir_patient')),
        getDocs(collection(db, 'fhir_practitioner')),
        getDocs(collection(db, 'fhir_observation')),
        getDocs(collection(db, 'fhir_encounter')),
      ]);

      return {
        lastSync: new Date().toISOString(),
        totalPatients: patientsSnap.size,
        totalPractitioners: practitionersSnap.size,
        totalObservations: observationsSnap.size,
        totalEncounters: encountersSnap.size,
        errors: 0,
        warnings: 0,
        status: 'complete',
      };
    } catch (error) {
      console.error('Error getting Firestore sync status:', error);
      throw error;
    }
  }

  /**
   * Get sync status from FHIR server metadata
   */
  private async getFHIRServerSyncStatus(): Promise<FHIRSyncStatus> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/fhir+json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      // Get counts for different resource types
      const [patientsBundle, practitionersBundle, observationsBundle, encountersBundle] = await Promise.all([
        fetch(`${this.baseUrl}/Patient?_summary=count`, { headers }).then(r => r.json()),
        fetch(`${this.baseUrl}/Practitioner?_summary=count`, { headers }).then(r => r.json()),
        fetch(`${this.baseUrl}/Observation?_summary=count`, { headers }).then(r => r.json()),
        fetch(`${this.baseUrl}/Encounter?_summary=count`, { headers }).then(r => r.json()),
      ]);

      return {
        lastSync: new Date().toISOString(),
        totalPatients: patientsBundle.total || 0,
        totalPractitioners: practitionersBundle.total || 0,
        totalObservations: observationsBundle.total || 0,
        totalEncounters: encountersBundle.total || 0,
        errors: 0,
        warnings: 0,
        status: 'complete',
      };
    } catch (error) {
      console.error('Error getting FHIR server sync status:', error);
      throw error;
    }
  }

  /**
   * Validate FHIR resource
   */
  async validateResource(resource: FHIRResource): Promise<{ valid: boolean; issues: string[] }> {
    try {
      // Basic validation - can be extended with proper FHIR validation
      const issues: string[] = [];
      
      if (!resource.resourceType) {
        issues.push('Missing resourceType');
      }
      
      if (!resource.id) {
        issues.push('Missing resource id');
      }

      return {
        valid: issues.length === 0,
        issues,
      };
    } catch (error) {
      console.error('Error validating FHIR resource:', error);
      return {
        valid: false,
        issues: ['Validation error occurred'],
      };
    }
  }
}

// Create singleton instance
export const realFHIRService = new RealFHIRService();

// Export types and service
export default realFHIRService;
