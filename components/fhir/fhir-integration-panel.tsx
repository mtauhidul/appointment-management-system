import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Input 
} from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Search, 
  UserPlus,
  Activity,
  Database,
  RefreshCw,
} from 'lucide-react';
import { useFHIRIntegration, useFHIRPatients, useFHIRPractitioners } from '@/hooks/useFHIR';
import { FHIRHelpers } from '@/lib/fhir/fhir-service';

interface FHIRIntegrationPanelProps {
  onPatientSync?: (patientId: string) => void;
  onPractitionerSync?: (practitionerId: string) => void;
}

export const FHIRIntegrationPanel: React.FC<FHIRIntegrationPanelProps> = ({
  onPatientSync,
  onPractitionerSync,
}) => {
  const { isConnected, isLoading, error, testConnection } = useFHIRIntegration();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              FHIR Integration
            </CardTitle>
            <CardDescription>
              eClinicalWorks FHIR API Integration Status
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Testing...
              </Badge>
            ) : isConnected ? (
              <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                <CheckCircle className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Disconnected
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={testConnection}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FHIRPatientSearch onPatientSync={onPatientSync} />
            <FHIRPractitionerSearch onPractitionerSync={onPractitionerSync} />
          </div>
        )}
        
        {!isConnected && !isLoading && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              FHIR integration is not available. Check your connection and try again.
            </p>
            <Button onClick={testConnection} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FHIRPatientSearch: React.FC<{ onPatientSync?: (patientId: string) => void }> = ({
  onPatientSync,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { patients, isLoading, error, searchPatients, syncPatient } = useFHIRPatients();

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      await searchPatients(searchTerm);
    }
  };

  const handleSyncPatient = async (fhirId: string) => {
    const synced = await syncPatient(fhirId);
    if (synced) {
      onPatientSync?.(synced.id);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed">
          <CardContent className="p-6 text-center">
            <UserPlus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Search FHIR Patients</h3>
            <p className="text-sm text-gray-600">Find and sync patients from EHR</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Search FHIR Patients</DialogTitle>
          <DialogDescription>
            Search for patients in the eClinicalWorks EHR system
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading || !searchTerm.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {patients.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="p-3 border rounded-md flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {FHIRHelpers.getDisplayName(patient.name)}
                    </p>
                    <p className="text-sm text-gray-600">
                      DOB: {FHIRHelpers.formatDate(patient.birthDate)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => patient.id && handleSyncPatient(patient.id)}
                  >
                    Sync
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {patients.length === 0 && searchTerm && !isLoading && !error && (
            <div className="text-center py-4">
              <p className="text-gray-600">No patients found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FHIRPractitionerSearch: React.FC<{ onPractitionerSync?: (practitionerId: string) => void }> = ({
  onPractitionerSync,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { practitioners, isLoading, error, searchPractitioners, syncPractitioner } = useFHIRPractitioners();

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      await searchPractitioners(searchTerm);
    }
  };

  const handleSyncPractitioner = async (fhirId: string) => {
    const synced = await syncPractitioner(fhirId);
    if (synced) {
      onPractitionerSync?.(synced.id);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed">
          <CardContent className="p-6 text-center">
            <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Search FHIR Practitioners</h3>
            <p className="text-sm text-gray-600">Find and sync doctors from EHR</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Search FHIR Practitioners</DialogTitle>
          <DialogDescription>
            Search for practitioners in the eClinicalWorks EHR system
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter practitioner name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading || !searchTerm.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {practitioners.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {practitioners.map((practitioner) => (
                <div
                  key={practitioner.id}
                  className="p-3 border rounded-md flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {FHIRHelpers.getDisplayName(practitioner.name)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {FHIRHelpers.getEmail(practitioner.telecom) || 
                       FHIRHelpers.getPhoneNumber(practitioner.telecom)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => practitioner.id && handleSyncPractitioner(practitioner.id)}
                  >
                    Sync
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {practitioners.length === 0 && searchTerm && !isLoading && !error && (
            <div className="text-center py-4">
              <p className="text-gray-600">No practitioners found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
