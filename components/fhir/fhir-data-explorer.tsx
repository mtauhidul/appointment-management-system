import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code, Database, Eye, FileJson, Filter, Search } from "lucide-react";
import React, { useState } from "react";

type FHIRSearchResult = {
  id: string;
  resourceType: string;
  lastUpdated: string;
  status: string;
  preview: string;
};

export const FHIRDataExplorer: React.FC = () => {
  const [resourceType, setResourceType] = useState("Patient");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<FHIRSearchResult[]>([]);

  const resourceTypes = [
    "Patient",
    "Practitioner",
    "Appointment",
    "Observation",
    "Condition",
    "MedicationRequest",
    "DiagnosticReport",
    "Procedure",
  ];

  const mockSearch = () => {
    // Mock search results
    const mockResults = [
      {
        id: "12345",
        resourceType: resourceType,
        lastUpdated: "2024-01-15T10:30:00Z",
        status: "active",
        preview: `${resourceType} resource with ID 12345`,
      },
      {
        id: "67890",
        resourceType: resourceType,
        lastUpdated: "2024-01-14T15:45:00Z",
        status: "active",
        preview: `${resourceType} resource with ID 67890`,
      },
    ];
    setResults(mockResults);
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
            Explore and query FHIR resources directly from your EHR system
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
                placeholder="Enter search criteria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={mockSearch} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Search Results</h4>
                <Badge variant="outline">{results.length} results found</Badge>
              </div>

              <div className="space-y-3">
                {results.map((result) => (
                  <Card
                    key={result.id}
                    className="border-l-4 border-l-blue-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Database className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium">
                              {result.resourceType}/{result.id}
                            </p>
                            <p className="text-sm text-gray-500">
                              {result.preview}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {result.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileJson className="h-3 w-3 mr-1" />
                            JSON
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Last updated:{" "}
                        {new Date(result.lastUpdated).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {results.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  FHIR Data Explorer
                </h3>
                <p className="text-gray-500 mb-4">
                  Search and explore FHIR resources from your connected EHR
                  system.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-md mx-auto">
                  <div className="p-3 border rounded-lg text-center">
                    <Code className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs font-medium">Raw FHIR</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <Filter className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xs font-medium">Filtered Views</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <Eye className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs font-medium">Live Data</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <FileJson className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-xs font-medium">JSON Export</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
