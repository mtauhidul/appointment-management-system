import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useFHIRIntegration } from '@/hooks/useFHIR';

export const FHIRSystemStatus: React.FC = () => {
  // Use actual FHIR integration hook
  const { isConnected, isLoading, error, testConnection } = useFHIRIntegration();

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    }
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    if (isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-orange-600" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Connecting...';
    if (error) return 'Connection Failed';
    if (isConnected) return 'Connected';
    return 'Not Connected';
  };

  const getStatusColor = () => {
    if (isLoading) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (error) return 'bg-red-100 text-red-800 border-red-200';
    if (isConnected) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">FHIR Integration Status</CardTitle>
          <Badge variant="outline" className={getStatusColor()}>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className="text-xs font-medium">{getStatusText()}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Connection Details</p>
            <div className="space-y-1 text-xs text-gray-600">
              <div>Endpoint: eClinicalWorks FHIR R4</div>
              <div>Auth: {isConnected ? 'Configured' : 'Not configured'}</div>
              <div>Last Check: {isLoading ? 'Checking...' : 'Just now'}</div>
              {error && <div className="text-red-600">Error: {error}</div>}
            </div>
          </div>
          <div className="space-y-2">
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
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={testConnection} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button size="sm" variant="outline">
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
