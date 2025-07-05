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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useFHIRPatients } from "@/hooks/useFHIR";
import { FHIRPatient } from "@/lib/types/fhir";
import {
  Calendar,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  User,
} from "lucide-react";
import React, { useState } from "react";

export const FHIRPatientManagement: React.FC = () => {
  const { toast } = useToast();
  const { patients, isLoading, error, searchPatients, syncPatient } =
    useFHIRPatients();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a search term to find patients.",
        variant: "destructive",
      });
      return;
    }

    try {
      await searchPatients(searchQuery);
      toast({
        title: "Search Complete",
        description: `Found ${patients.length} patients matching "${searchQuery}".`,
      });
    } catch (err) {
      toast({
        title: "Search Failed",
        description:
          err instanceof Error
            ? err.message
            : "Failed to search for patients. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSyncPatient = async (patientId: string) => {
    try {
      const result = await syncPatient(patientId);
      if (result) {
        toast({
          title: "Patient Synced",
          description: "Patient data has been successfully synced to Firebase.",
        });
      }
    } catch (err) {
      toast({
        title: "Sync Failed",
        description:
          err instanceof Error
            ? err.message
            : "Failed to sync patient data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPatientName = (patient: FHIRPatient) => {
    if (patient.name && patient.name.length > 0) {
      const name = patient.name[0];
      return `${name.given?.join(" ") || ""} ${name.family || ""}`.trim();
    }
    return "Unknown";
  };

  const getPatientContact = (patient: FHIRPatient, type: "phone" | "email") => {
    if (patient.telecom) {
      const contact = patient.telecom.find((t) => t.system === type);
      return contact?.value || "N/A";
    }
    return "N/A";
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search FHIR Patients
          </CardTitle>
          <CardDescription>
            Search for patients in the eClinicalWorks FHIR database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Term</Label>
              <Input
                id="search"
                placeholder="Enter patient name, ID, or other identifier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Search Results
            </div>
            <Badge variant="outline">{patients.length} patients found</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Birth Date</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient: FHIRPatient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {getPatientName(patient)}
                    </TableCell>
                    <TableCell>
                      {patient.birthDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(patient.birthDate).toLocaleDateString()}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {patient.gender || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {getPatientContact(patient, "phone")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {getPatientContact(patient, "email")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() =>
                          patient.id && handleSyncPatient(patient.id)
                        }
                        disabled={isLoading || !patient.id}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No patients found
              </h3>
              <p className="text-gray-500 text-center mb-4">
                Search for patients using the search form above to get started.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                <Search className="h-4 w-4 mr-2" />
                Start New Search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
