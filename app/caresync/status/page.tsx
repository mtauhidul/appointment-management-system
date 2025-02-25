"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toast, ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useStatusStore } from "@/lib/store/useStatusStore";
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { SketchPicker } from "react-color";
import tinycolor from "tinycolor2";

const StatusSection = () => {
  const { toast } = useToast();
  const { statuses, addStatus, updateStatus, deleteStatus } = useStatusStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState({
    name: "",
    color: "#dddddd", // Default light gray
    activityType: "",
    hasSound: false,
  });
  const [loading, setLoading] = useState(false);

  // ✅ Reset the Dialog
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

  // ✅ Save or Update Status
  const saveStatus = () => {
    if (!newStatus.name || !newStatus.color || !newStatus.activityType) {
      toast({
        title: "Error",
        description: "Please fill out all fields!",
        variant: "destructive",
      });
      return;
    }

    // ✅ Prevent Duplicate Status Names
    const existingStatus = statuses.find(
      (status) => status.name.toLowerCase() === newStatus.name.toLowerCase()
    );
    if (!isEditing && existingStatus) {
      toast({
        title: "Error",
        description: "A status with this name already exists!",
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
          title: "Success",
          description: "Status updated successfully!",
        });
      } else {
        addStatus({
          id: crypto.randomUUID(), // ✅ Use secure unique ID
          name: newStatus.name,
          color: tinycolor(newStatus.color).toString(),
          activityType: newStatus.activityType,
          hasSound: newStatus.hasSound,
        });
        toast({
          title: "Success",
          description: "Status created successfully!",
        });
      }
      resetDialog();
    }, 1000);
  };

  // ✅ Remove Status
  const removeStatus = (statusId: string) => {
    setLoading(true);
    setTimeout(() => {
      deleteStatus(statusId);
      toast({
        title: "Success",
        description: "Status deleted successfully!",
      });
      resetDialog();
    }, 500);
  };

  return (
    <ToastProvider>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Statuses</h2>
          <Button onClick={() => setIsDialogOpen(true)}>Add New Status</Button>
        </div>

        {/* ✅ Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {statuses.map((status) => (
            <div
              key={status.id}
              className="flex items-center justify-between border p-4 rounded-lg shadow-sm bg-white hover:shadow-md"
              style={{ borderLeft: `4px solid ${status.color}` }}
            >
              <div>
                <h3 className="font-semibold">{status.name}</h3>
                <p className="text-sm text-gray-500">{status.activityType}</p>
                <p className="text-sm text-gray-500">
                  Notification: {status.hasSound ? "Yes" : "No"}
                </p>
              </div>
              <div className="flex space-x-2">
                {/* ✅ Edit Status */}
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setIsEditing(status.id);
                        setNewStatus({
                          ...status,
                          hasSound: status.hasSound ?? false, // ✅ Ensure boolean value
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>

                {/* ✅ Delete Status */}
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeStatus(status.id)}
                      className="text-red-500 hover:bg-red-100"
                    >
                      <Trash />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Add/Edit Status Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Status" : "Add Status"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter status name"
                value={newStatus.name}
                onChange={(e) =>
                  setNewStatus({ ...newStatus, name: e.target.value })
                }
              />
              <div>
                <p className="mb-2 text-sm">Choose a color</p>
                <SketchPicker
                  color={newStatus.color}
                  onChangeComplete={
                    (color) =>
                      setNewStatus({
                        ...newStatus,
                        color: color.hex,
                      }) // Auto-lighten selected color
                  }
                />
              </div>

              {/* ✅ Activity Type Selection */}
              <Select
                onValueChange={(value) =>
                  setNewStatus({ ...newStatus, activityType: value })
                }
                value={newStatus.activityType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Patient">Patient</SelectItem>
                </SelectContent>
              </Select>

              {/* ✅ Notification Sound Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newStatus.hasSound}
                  onChange={(e) =>
                    setNewStatus({ ...newStatus, hasSound: e.target.checked })
                  }
                />
                <label className="text-sm">Add notification sound</label>
              </div>
            </div>

            {/* ✅ Save Button */}
            <Button
              onClick={saveStatus}
              className="mt-4 w-full"
              disabled={loading}
            >
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Save"}
            </Button>
          </DialogContent>
        </Dialog>
        <Toast />
      </div>
      <Toaster />
    </ToastProvider>
  );
};
// Removed the unimplemented tinycolor function

export default StatusSection;
