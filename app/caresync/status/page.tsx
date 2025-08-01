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
  const { statuses, addStatusToFirestore, updateStatusInFirestore, deleteStatusFromFirestore, isLoading } = useStatusStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState({
    name: "",
    color: "#dddddd",
    activityType: "",
    hasSound: false,
  });
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
  };

  // Save or Update Status with validation
  const saveStatus = async () => {
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
    
    try {
      let success = false;
      
      if (isEditing) {
        success = await updateStatusInFirestore(isEditing, {
          ...newStatus,
          color: tinycolor(newStatus.color).toString(),
        });
        
        if (success) {
          toast({
            title: "Status Updated",
            description: `"${newStatus.name}" has been updated successfully.`,
          });
        } else {
          toast({
            title: "Update Failed",
            description: "Failed to update status. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        success = await addStatusToFirestore({
          name: newStatus.name,
          color: tinycolor(newStatus.color).toString(),
          activityType: newStatus.activityType,
          hasSound: newStatus.hasSound,
        });
        
        if (success) {
          toast({
            title: "Status Created",
            description: `"${newStatus.name}" has been added successfully.`,
          });
        } else {
          toast({
            title: "Creation Failed",
            description: "Failed to create status. Please try again.",
            variant: "destructive",
          });
        }
      }
      
      if (success) {
        resetDialog();
      }
    } catch (error) {
      console.error('Error saving status:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle status removal with confirmation
  const removeStatus = async (statusId: string) => {
    if (deleteConfirmId !== statusId) {
      setDeleteConfirmId(statusId);
      return;
    }
    
    try {
      const success = await deleteStatusFromFirestore(statusId);
      
      if (success) {
        toast({
          title: "Status Removed",
          description: "The status has been removed successfully.",
        });
        setDeleteConfirmId(null);
        resetDialog();
      } else {
        toast({
          title: "Deletion Failed",
          description: "Failed to delete status. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting status:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Activity type options for rooms
  const activityTypes = [
    { value: "Examination", label: "Examination Room" },
    { value: "Treatment", label: "Treatment Room" },
    { value: "Consultation", label: "Consultation Room" },
    { value: "Emergency", label: "Emergency Room" },
    { value: "Surgery", label: "Surgery Room" },
    { value: "Recovery", label: "Recovery Room" },
    { value: "Cleaning", label: "Cleaning/Maintenance" },
    { value: "General", label: "General Purpose" },
  ];

  // Get badge color based on room type
  const getActivityTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Examination":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Treatment":
        return "bg-green-100 text-green-800 border-green-200";
      case "Consultation":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Emergency":
        return "bg-red-100 text-red-800 border-red-200";
      case "Surgery":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Recovery":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "Cleaning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "General":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4 sm:space-y-6 max-w-7xl">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-auto">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Status Management
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
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
            <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-muted/50 rounded-lg border border-dashed">
              <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-center">
                No room statuses created
              </h3>
              <p className="text-sm text-muted-foreground text-center mt-1 mb-3 sm:mb-4 px-2">
                Create your first room status to get started with room activity
                tracking
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Add Your First Room Status
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {statuses.map((status) => (
                <Card
                  key={status.id}
                  className="transition-all duration-200 hover:shadow-md h-full"
                  style={{ borderLeft: `4px solid ${status.color}` }}
                >
                  <CardHeader className="pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-base sm:text-lg leading-tight">
                        {status.name}
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setIsEditing(status.id);
                                setNewStatus({
                                  ...status,
                                  hasSound: status.hasSound ?? false,
                                });
                                setIsDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
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
                              className="h-7 w-7 sm:h-8 sm:w-8"
                              onClick={() => removeStatus(status.id)}
                            >
                              <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
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

                  <CardContent className="pb-3 sm:pb-4 px-3 sm:px-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Badge
                          variant="outline"
                          className={`${getActivityTypeBadgeColor(
                            status.activityType
                          )} text-xs`}
                        >
                          {status.activityType}
                        </Badge>

                        {status.hasSound ? (
                          <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                            <Bell className="h-3 w-3 mr-1 flex-shrink-0" /> With
                            notification
                          </div>
                        ) : (
                          <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                            <BellOff className="h-3 w-3 mr-1 flex-shrink-0" />{" "}
                            Silent
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="h-4 w-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="text-xs text-muted-foreground overflow-hidden text-ellipsis">
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
            <DialogContent className="w-full max-w-md mx-auto p-3 sm:p-4 md:p-6 max-h-[95vh] overflow-y-auto">
              <DialogHeader className="space-y-1 sm:space-y-2">
                <DialogTitle className="text-lg sm:text-xl">
                  {isEditing ? "Edit Room Status" : "Create New Room Status"}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  {isEditing
                    ? "Update the properties of this room status."
                    : "Define a new status type for rooms in the system."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 sm:space-y-4 py-1 sm:py-2">
                <div className="space-y-1 sm:space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs sm:text-sm font-medium"
                  >
                    Room Status Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="E.g., Doctor In, Patient Ready, Ready for Cleaning"
                    value={newStatus.name}
                    onChange={(e) =>
                      setNewStatus({ ...newStatus, name: e.target.value })
                    }
                    className="w-full text-sm"
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label
                    htmlFor="activity-type"
                    className="text-xs sm:text-sm font-medium"
                  >
                    Room Type
                  </Label>
                  <Select
                    value={newStatus.activityType}
                    onValueChange={(value) =>
                      setNewStatus({ ...newStatus, activityType: value })
                    }
                  >
                    <SelectTrigger
                      id="activity-type"
                      className="w-full text-sm"
                    >
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-auto">
                      {activityTypes.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="text-sm"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">
                    Status Color
                  </Label>
                  <div className="border rounded-md p-1 sm:p-2 overflow-hidden">
                    <div className="w-full overflow-x-auto">
                      <SketchPicker
                        color={newStatus.color}
                        onChangeComplete={(color) =>
                          setNewStatus({ ...newStatus, color: color.hex })
                        }
                        disableAlpha
                        width="100%"
                        presetColors={[
                          "#D0021B", // Red - Emergency
                          "#F5A623", // Orange - Surgery
                          "#F8E71C", // Yellow - Cleaning
                          "#7ED321", // Green - Treatment
                          "#417505", // Dark Green - Recovery
                          "#4A90E2", // Blue - Examination
                          "#50E3C2", // Teal - General
                          "#9013FE", // Purple - Consultation
                          "#BD10E0", // Pink - Special
                          "#9B9B9B", // Gray - Out of Service
                        ]}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="notification"
                      className="text-xs sm:text-sm font-medium"
                    >
                      Status Change Alert
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Play sound when room status changes
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

              <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-2 mt-3 sm:mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveStatus}
                  disabled={isLoading}
                  className="w-full sm:w-auto text-sm"
                >
                  {isLoading
                    ? "Saving..."
                    : isEditing
                    ? "Update Room Status"
                    : "Create Room Status"}
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
