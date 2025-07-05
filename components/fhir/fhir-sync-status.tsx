import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import React from "react";

export const FHIRSyncStatus: React.FC = () => {
  // Mock sync status data
  const syncStats = [
    {
      resource: "Patients",
      lastSync: "2 hours ago",
      status: "success",
      count: 1250,
    },
    {
      resource: "Practitioners",
      lastSync: "1 hour ago",
      status: "success",
      count: 85,
    },
    {
      resource: "Appointments",
      lastSync: "30 minutes ago",
      status: "warning",
      count: 324,
    },
    {
      resource: "Clinical Data",
      lastSync: "45 minutes ago",
      status: "syncing",
      count: 567,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "syncing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sync Status & Monitoring
          </CardTitle>
          <CardDescription>
            Monitor FHIR data synchronization status and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {syncStats.map((stat) => (
              <Card key={stat.resource}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{stat.resource}</h4>
                    {getStatusIcon(stat.status)}
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {stat.count.toLocaleString()}
                    </p>
                    <Badge
                      variant="outline"
                      className={getStatusBadge(stat.status)}
                    >
                      {stat.status === "syncing"
                        ? "Syncing..."
                        : stat.status === "success"
                        ? "Up to date"
                        : stat.status === "warning"
                        ? "Needs attention"
                        : "Pending"}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      Last sync: {stat.lastSync}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">System Health</h4>
            </div>
            <p className="text-sm text-blue-700">
              All FHIR services are operational. Next scheduled sync in 15
              minutes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
