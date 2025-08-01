'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, CheckCircle, AlertCircle, Users, Stethoscope } from 'lucide-react';
import fhirService, { type FHIRSyncStatus as SyncStatusType } from '@/lib/services/fhir-service-firestore';

export function FHIRSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSyncStatus = async () => {
    try {
      setLoading(true);
      const status = await fhirService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error loading FHIR sync status:', error);
      // Set error status
      setSyncStatus({
        lastSync: new Date().toISOString(),
        totalPatients: 0,
        totalPractitioners: 0,
        totalObservations: 0,
        totalEncounters: 0,
        errors: 1,
        warnings: 0,
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSyncStatus();
    setRefreshing(false);
  };

  useEffect(() => {
    loadSyncStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSyncStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'syncing':
        return 'bg-blue-100 text-blue-800';
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            FHIR Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading sync status...</div>
        </CardContent>
      </Card>
    );
  }

  if (!syncStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            FHIR Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600">Failed to load sync status</div>
          <Button onClick={handleRefresh} className="w-full mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(syncStatus.status)}
            FHIR Sync Status
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge className={getStatusColor(syncStatus.status)}>
            {syncStatus.status.charAt(0).toUpperCase() + syncStatus.status.slice(1)}
          </Badge>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Last Sync:</span>
          <span className="text-sm text-muted-foreground">
            {formatLastSync(syncStatus.lastSync)}
          </span>
        </div>

        {/* Resource Counts */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Resource Counts</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {syncStatus.totalPatients.toLocaleString()}
                </div>
                <div className="text-xs text-blue-600">Patients</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Stethoscope className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">
                  {syncStatus.totalPractitioners.toLocaleString()}
                </div>
                <div className="text-xs text-green-600">Practitioners</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <div className="h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">O</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  {syncStatus.totalObservations.toLocaleString()}
                </div>
                <div className="text-xs text-purple-600">Observations</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <div className="h-5 w-5 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">E</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-900">
                  {syncStatus.totalEncounters.toLocaleString()}
                </div>
                <div className="text-xs text-orange-600">Encounters</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error/Warning Summary */}
        {(syncStatus.errors > 0 || syncStatus.warnings > 0) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Issues</h4>
            {syncStatus.errors > 0 && (
              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-sm text-red-700">Errors:</span>
                <Badge variant="destructive">{syncStatus.errors}</Badge>
              </div>
            )}
            {syncStatus.warnings > 0 && (
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm text-yellow-700">Warnings:</span>
                <Badge className="bg-yellow-100 text-yellow-800">{syncStatus.warnings}</Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FHIRSyncStatus;
