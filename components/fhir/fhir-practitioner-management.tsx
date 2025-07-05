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
import { useFHIRPractitioners } from "@/hooks/useFHIR";
import { FHIRPractitioner } from "@/lib/types/fhir";
import {
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import React, { useState } from "react";

export const FHIRPractitionerManagement: React.FC = () => {
  const { toast } = useToast();
  const {
    practitioners,
    isLoading,
    error,
    searchPractitioners,
    syncPractitioner,
  } = useFHIRPractitioners();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a search term to find practitioners.",
        variant: "destructive",
      });
      return;
    }

    try {
      await searchPractitioners(searchQuery);
      toast({
        title: "Search Complete",
        description: `Found ${practitioners.length} practitioners matching "${searchQuery}".`,
      });
    } catch (err) {
      toast({
        title: "Search Failed",
        description:
          err instanceof Error
            ? err.message
            : "Failed to search for practitioners. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSyncPractitioner = async (practitionerId: string) => {
    try {
      const result = await syncPractitioner(practitionerId);
      if (result) {
        toast({
          title: "Practitioner Synced",
          description:
            "Practitioner data has been successfully synced to Firebase.",
        });
      }
    } catch (err) {
      toast({
        title: "Sync Failed",
        description:
          err instanceof Error
            ? err.message
            : "Failed to sync practitioner data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPractitionerName = (practitioner: FHIRPractitioner) => {
    if (practitioner.name && practitioner.name.length > 0) {
      const name = practitioner.name[0];
      return `${name.given?.join(" ") || ""} ${name.family || ""}`.trim();
    }
    return "Unknown";
  };

  const getPractitionerContact = (
    practitioner: FHIRPractitioner,
    type: "phone" | "email"
  ) => {
    if (practitioner.telecom) {
      const contact = practitioner.telecom.find((t) => t.system === type);
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
            Search FHIR Practitioners
          </CardTitle>
          <CardDescription>
            Search for medical practitioners in the eClinicalWorks FHIR database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Term</Label>
              <Input
                id="search"
                placeholder="Enter practitioner name, NPI, or other identifier..."
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
              <UserCheck className="h-5 w-5" />
              Search Results
            </div>
            <Badge variant="outline">
              {practitioners.length} practitioners found
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {practitioners.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {practitioners.map((practitioner: FHIRPractitioner) => (
                  <TableRow key={practitioner.id}>
                    <TableCell className="font-medium">
                      {getPractitionerName(practitioner)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Stethoscope className="h-3 w-3" />
                        {practitioner.qualification?.[0]?.code?.text || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {getPractitionerContact(practitioner, "phone")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {getPractitionerContact(practitioner, "email")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={practitioner.active ? "default" : "secondary"}
                      >
                        {practitioner.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() =>
                          practitioner.id &&
                          handleSyncPractitioner(practitioner.id)
                        }
                        disabled={isLoading || !practitioner.id}
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
              <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No practitioners found
              </h3>
              <p className="text-gray-500 text-center mb-4">
                Search for practitioners using the search form above to get
                started.
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
