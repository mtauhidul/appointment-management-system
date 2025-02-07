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
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { SketchPicker } from "react-color";

type Status = {
  id: number;
  name: string;
  color: string;
  activityType: "Doctor" | "Staff" | "Patient";
  hasNotification: boolean;
};

const StatusSection = () => {
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<Status[]>([
    {
      id: 1,
      name: "Doctor In",
      color: "#34D399",
      activityType: "Doctor",
      hasNotification: true,
    },
    {
      id: 2,
      name: "Emergency",
      color: "#F87171",
      activityType: "Doctor",
      hasNotification: false,
    },
    {
      id: 3,
      name: "On Break",
      color: "#FBBF24",
      activityType: "Doctor",
      hasNotification: true,
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<Status | null>(null);
  const [newStatus, setNewStatus] = useState<Partial<Status>>({});
  const [loading, setLoading] = useState(false);

  const saveStatus = () => {
    if (!newStatus.name || !newStatus.color || !newStatus.activityType) {
      toast({
        title: "Error",
        description: "Please fill out all fields!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (isEditing) {
        setStatuses((prev) =>
          prev.map((status) =>
            status.id === isEditing.id ? { ...status, ...newStatus } : status
          )
        );
        toast({
          title: "Success",
          description: "Status updated successfully!",
        });
      } else {
        setStatuses((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            name: newStatus.name!,
            color: newStatus.color!,
            activityType: newStatus.activityType!,
            hasNotification: newStatus.hasNotification || false,
          },
        ]);
        toast({
          title: "Success",
          description: "Status created successfully!",
        });
      }
      resetDialog();
    }, 1000);
  };

  const deleteStatus = (id: number) => {
    setStatuses((prev) => prev.filter((status) => status.id !== id));
    toast({
      title: "Deleted",
      description: "Status deleted successfully!",
    });
  };

  const resetDialog = () => {
    setNewStatus({});
    setIsEditing(null);
    setIsDialogOpen(false);
    setLoading(false);
  };

  return (
    <ToastProvider>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Statuses</h2>
          <Button onClick={() => setIsDialogOpen(true)}>Add New Status</Button>
        </div>

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
                  Notification: {status.hasNotification ? "Yes" : "No"}
                </p>
              </div>
              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setIsEditing(status);
                        setNewStatus(status);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteStatus(status.id)}
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
                value={newStatus.name || ""}
                onChange={(e) =>
                  setNewStatus({ ...newStatus, name: e.target.value })
                }
              />
              <div>
                <p className="mb-2 text-sm">Choose a color</p>
                <SketchPicker
                  color={newStatus.color || "#000"}
                  onChangeComplete={(color: { hex: string }) =>
                    setNewStatus({ ...newStatus, color: color.hex })
                  }
                />
              </div>
              <Select
                onValueChange={(value) =>
                  setNewStatus({
                    ...newStatus,
                    activityType: value as Status["activityType"],
                  })
                }
                value={newStatus.activityType || ""}
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
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newStatus.hasNotification || false}
                  onChange={(e) =>
                    setNewStatus({
                      ...newStatus,
                      hasNotification: e.target.checked,
                    })
                  }
                />
                <label className="text-sm">Add notification sound</label>
              </div>
            </div>
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

export default StatusSection;
