"use client";

import { AlertCircle, Bell, BellOff, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { SketchPicker } from "react-color";
import tinycolor from "tinycolor2";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Toast, ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useStatusStore } from "@/lib/store/useStatusStore";

const StatusSection = () => {
  const { toast } = useToast();
  const { statuses, addStatus, updateStatus, deleteStatus } = useStatusStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState({
    name: "",
    color: "#dddddd",
    activityType: "",
    hasSound: false,
  });
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Reset the Dialog to initial state
  const resetDialog = () => {
    setNewStatus({
      name: "",
      color: "#dddddd",
      activityType: "",
      hasSound: false,
    });
    setIsEditing(null);
    setIsDialogOpen(false);
    setLoading(false);
  };

  // Save or Update Status with validation
  const saveStatus = () => {
    if (!newStatus.name || !newStatus.color || !newStatus.activityType) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Prevent Duplicate Status Names (only for new statuses)
    const isDuplicate = statuses.some(
      (status) =>
        status.name.toLowerCase() === newStatus.name.toLowerCase() &&
        (!isEditing || status.id !== isEditing)
    );

    if (isDuplicate) {
      toast({
        title: "Duplicate Status",
        description: "A status with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (isEditing) {
        updateStatus(isEditing, {
          ...newStatus,
          color: tinycolor(newStatus.color).toString(),
        });
        toast({
          title: "Status Updated",
          description: `"${newStatus.name}" has been updated successfully.`,
        });
      } else {
        addStatus({
          id: crypto.randomUUID(),
          name: newStatus.name,
          color: tinycolor(newStatus.color).toString(),
          activityType: newStatus.activityType,
          hasSound: newStatus.hasSound,
        });
        toast({
          title: "Status Created",
          description: `"${newStatus.name}" has been added successfully.`,
        });
      }
      resetDialog();
    }, 800); // Reduced timeout for better UX
  };

  // Handle status removal with confirmation
  const removeStatus = (statusId: string) => {
    if (deleteConfirmId !== statusId) {
      setDeleteConfirmId(statusId);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      deleteStatus(statusId);
      toast({
        title: "Status Removed",
        description: "The status has been removed successfully.",
      });
      setDeleteConfirmId(null);
      resetDialog();
    }, 500);
  };

  // Activity type options
  const activityTypes = [
    { value: "Doctor", label: "Doctor" },
    { value: "Staff", label: "Staff" },
    { value: "Patient", label: "Patient" },
  ];

  // Get badge color based on activity type
  const getActivityTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Doctor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Staff":
        return "bg-green-100 text-green-800 border-green-200";
      case "Patient":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="container mx-auto p-4 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Status Management
              </h2>
              <p className="text-muted-foreground mt-1">
                Create and manage status types for different users in the system
              </p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto"
              size="default"
            >
              Add New Status
            </Button>
          </div>

          {/* Status Grid */}
          {statuses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-lg border border-dashed">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No statuses created</h3>
              <p className="text-muted-foreground text-center mt-1 mb-4">
                Create your first status to get started with user activity
                tracking
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Add Your First Status
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {statuses.map((status) => (
                <Card
                  key={status.id}
                  className="transition-all duration-200 hover:shadow-md"
                  style={{ borderLeft: `4px solid ${status.color}` }}
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg leading-none">
                        {status.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setIsEditing(status.id);
                                setNewStatus({
                                  ...status,
                                  hasSound: status.hasSound ?? false,
                                });
                                setIsDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Status</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={
                                deleteConfirmId === status.id
                                  ? "destructive"
                                  : "ghost"
                              }
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeStatus(status.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {deleteConfirmId === status.id
                              ? "Confirm Delete"
                              : "Delete Status"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4 px-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={getActivityTypeBadgeColor(
                            status.activityType
                          )}
                        >
                          {status.activityType}
                        </Badge>

                        {status.hasSound ? (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Bell className="h-3 w-3 mr-1" /> With notification
                          </div>
                        ) : (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <BellOff className="h-3 w-3 mr-1" /> Silent
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {status.color}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add/Edit Status Dialog */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetDialog();
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Status" : "Create New Status"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? "Update the properties of this status."
                    : "Define a new status type for the system."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Status Name</Label>
                  <Input
                    id="name"
                    placeholder="E.g., Available, Busy, Away"
                    value={newStatus.name}
                    onChange={(e) =>
                      setNewStatus({ ...newStatus, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-type">Activity Type</Label>
                  <Select
                    value={newStatus.activityType}
                    onValueChange={(value) =>
                      setNewStatus({ ...newStatus, activityType: value })
                    }
                  >
                    <SelectTrigger id="activity-type">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status Color</Label>
                  <div className="border rounded-md p-2">
                    <SketchPicker
                      color={newStatus.color}
                      onChangeComplete={(color) =>
                        setNewStatus({ ...newStatus, color: color.hex })
                      }
                      disableAlpha
                      presetColors={[
                        "#D0021B",
                        "#F5A623",
                        "#F8E71C",
                        "#8B572A",
                        "#7ED321",
                        "#417505",
                        "#4A90E2",
                        "#50E3C2",
                        "#B8E986",
                        "#9013FE",
                        "#BD10E0",
                        "#9B9B9B",
                      ]}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notification">Notification Sound</Label>
                    <p className="text-sm text-muted-foreground">
                      Play sound when status changes
                    </p>
                  </div>
                  <Switch
                    id="notification"
                    checked={newStatus.hasSound}
                    onCheckedChange={(checked) =>
                      setNewStatus({ ...newStatus, hasSound: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={saveStatus} disabled={loading}>
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Status"
                    : "Create Status"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Toast />
        </div>
        <Toaster />
      </ToastProvider>
    </TooltipProvider>
  );
};

export default StatusSection;
