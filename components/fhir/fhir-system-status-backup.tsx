import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  RefreshCw,
  Database,
} from 'lucide-react';
import { useFHIRIntegration } from '@/hooks/useFHIR';

export const FHIRSystemStatus: React.FC = () => {
  const { isConnected, isLoading, error, testConnection } = useFHIRIntegration();

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    }
    if (isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Testing Connection...';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  const getStatusBadge = () => {
    if (isLoading) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Testing...
        </Badge>
      );
    }
    if (isConnected) {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-600">
          <CheckCircle className="h-3 w-3" />
          Online
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Offline
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-gray-600" />
            <div>
              <CardTitle className="text-base">System Status</CardTitle>
              <CardDescription className="text-sm">
                External integrations and connectivity
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={testConnection}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* FHIR Integration Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <div>
                <p className="font-medium text-sm">FHIR API Integration</p>
                <p className="text-xs text-gray-600">eClinicalWorks EHR System</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
          </div>
        </div>

        {/* Connection Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-600">Status</span>
            <span className="font-medium">{getStatusText()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600">Endpoint</span>
            <span className="font-mono text-xs">fhir4.eclinicalworks.com</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600">Version</span>
            <span className="font-medium">FHIR R4</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Connection Error</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isConnected && !error && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">
                FHIR integration is active and ready for data exchange
              </p>
            </div>
          </div>
        )}

        {/* Integration Features */}
        <div className="border-t pt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Available Features</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Patient Search</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Practitioner Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Appointment Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Clinical Records</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
