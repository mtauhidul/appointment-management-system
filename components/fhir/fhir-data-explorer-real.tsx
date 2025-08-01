'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database, Eye, FileJson, Search, Loader2 } from 'lucide-react';
import fhirService, { type FHIRResource } from '@/lib/services/fhir-service-firestore';

type FHIRSearchResult = {
  id: string;
  resourceType: string;
  lastUpdated: string;
  status: string;
  preview: string;
  resource: FHIRResource;
};

export function FHIRDataExplorer() {
  const [resourceType, setResourceType] = useState('Patient');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<FHIRSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState<FHIRResource | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resourceTypes = [
    'Patient',
    'Practitioner',
    'Appointment',
    'Observation',
    'Condition',
    'MedicationRequest',
    'DiagnosticReport',
    'Procedure',
    'Encounter',
    'AllergyIntolerance',
  ];

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Parse search query into parameters
      const params: Record<string, string> = {};
      if (searchQuery.trim()) {
        // Simple parsing - can be enhanced based on FHIR search syntax
        const pairs = searchQuery.split('&');
        pairs.forEach(pair => {
          const [key, value] = pair.split('=');
          if (key && value) {
            params[key.trim()] = value.trim();
          }
        });
        
        // If no key-value pairs, treat as a general search
        if (Object.keys(params).length === 0) {
          params['_text'] = searchQuery.trim();
        }
      }

      const bundle = await fhirService.searchResources({
        resourceType,
        params,
        count: 20,
      });

      // Convert bundle entries to search results
      const searchResults: FHIRSearchResult[] = (bundle.entry || []).map(entry => {
        const resource = entry.resource;
        const lastUpdated = resource.meta?.lastUpdated || new Date().toISOString();
        
        // Generate preview based on resource type
        let preview = `${resource.resourceType}/${resource.id}`;
        let status = 'unknown';

        // Resource-specific preview and status extraction
        switch (resource.resourceType) {
          case 'Patient':
            const patient = resource as FHIRResource & {
              name?: Array<{ given?: string[]; family?: string }>;
              active?: boolean;
            };
            if (patient.name && patient.name[0]) {
              const name = patient.name[0];
              preview = `${name.given?.join(' ') || ''} ${name.family || ''}`.trim() || preview;
            }
            status = patient.active ? 'active' : 'inactive';
            break;
            
          case 'Practitioner':
            const practitioner = resource as FHIRResource & {
              name?: Array<{ given?: string[]; family?: string }>;
              active?: boolean;
            };
            if (practitioner.name && practitioner.name[0]) {
              const name = practitioner.name[0];
              preview = `${name.given?.join(' ') || ''} ${name.family || ''}`.trim() || preview;
            }
            status = practitioner.active ? 'active' : 'inactive';
            break;
            
          case 'Observation':
            const observation = resource as FHIRResource & {
              code?: { text?: string };
              status?: string;
            };
            if (observation.code?.text) {
              preview = observation.code.text;
            }
            status = observation.status || 'unknown';
            break;
            
          default:
            const resourceWithStatus = resource as FHIRResource & { status?: string };
            if (resourceWithStatus.status) {
              status = resourceWithStatus.status;
            }
            break;
        }

        return {
          id: resource.id,
          resourceType: resource.resourceType,
          lastUpdated,
          status,
          preview,
          resource,
        };
      });

      setResults(searchResults);
    } catch (err) {
      console.error('Error searching FHIR resources:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResource = (resource: FHIRResource) => {
    setSelectedResource(resource);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            FHIR Data Explorer
          </CardTitle>
          <CardDescription>
            Explore and query FHIR resources directly from your healthcare data store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Resource Type</Label>
              <Select value={resourceType} onValueChange={setResourceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Search Parameters</Label>
              <Input
                placeholder="Enter search criteria (e.g., family=Smith or active=true)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </div>

          {/* Search Help */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>Search examples:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Patient: <code>family=Smith</code> or <code>given=John</code></li>
              <li>Practitioner: <code>name=Dr</code> or <code>active=true</code></li>
              <li>Observation: <code>code=blood-pressure</code> or <code>status=final</code></li>
              <li>General: Leave empty to search all resources of selected type</li>
            </ul>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <Eye className="h-4 w-4" />
                <span className="font-medium">Search Error</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Search Results ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.preview}</span>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {result.id} • Last Updated: {formatDate(result.lastUpdated)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewResource(result.resource)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resource Viewer */}
      {selectedResource && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                {selectedResource.resourceType}/{selectedResource.id}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedResource(null)}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(selectedResource, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Results</h3>
            <p className="text-muted-foreground mb-4">
              Select a resource type and click Search to explore your FHIR data
            </p>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search All {resourceType} Resources
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default FHIRDataExplorer;
