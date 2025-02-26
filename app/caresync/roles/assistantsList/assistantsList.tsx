"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAssistantStore } from "@/lib/store/useAssistantStore";
import { useDoctorStore } from "@/lib/store/useDoctorStore";
import {
  Edit,
  Mail,
  Phone,
  Plus,
  Trash2,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const AssistantsList = () => {
  const { assistants, addAssistant, updateAssistant, deleteAssistant } =
    useAssistantStore();
  const { doctors, assignAssistant, removeAssistant } = useDoctorStore();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    doctorsAssigned: string[];
  } | null>(null);
  const [newAssistant, setNewAssistant] = useState({
    name: "",
    email: "",
    phone: "",
    doctorsAssigned: [] as string[],
  });

  // Responsive state
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  // Track screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        isMobile: window.innerWidth < 640,
        isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
      });
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSaveAssistant = () => {
    if (!newAssistant.name || !newAssistant.email || !newAssistant.phone) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All fields are required!",
      });
      return;
    }

    if (selectedAssistant) {
      updateAssistant(selectedAssistant.id, {
        ...newAssistant,
        doctorsAssigned: newAssistant.doctorsAssigned.filter((id) =>
          doctors.some((doctor) => doctor.id === id)
        ), // ✅ Only keep valid doctor IDs
      });

      // ✅ Update assistant assignments in doctors
      doctors.forEach((doctor) => {
        if (doctor.assistantsAssigned.includes(selectedAssistant.id)) {
          if (!newAssistant.doctorsAssigned.includes(doctor.id)) {
            removeAssistant(doctor.id, selectedAssistant.id);
          }
        }
        if (newAssistant.doctorsAssigned.includes(doctor.id)) {
          assignAssistant(doctor.id, selectedAssistant.id);
        }
      });

      toast({
        title: "Assistant Updated",
        description: `${newAssistant.name} has been updated.`,
      });
    } else {
      const newAssistantId = Math.random().toString(36).substr(2, 9);
      addAssistant({
        id: newAssistantId,
        ...newAssistant,
      });

      // ✅ Assign assistant to doctors
      newAssistant.doctorsAssigned.forEach((doctorId) => {
        assignAssistant(doctorId, newAssistantId);
      });

      toast({
        title: "Assistant Added",
        description: `${newAssistant.name} has been added.`,
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setSelectedAssistant(null);
    setNewAssistant({ name: "", email: "", phone: "", doctorsAssigned: [] });
  };

  // Helper function to truncate text for mobile
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Assistants</h2>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="w-full sm:w-auto gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Assistant
        </Button>
      </div>

      {assistants.length === 0 ? (
        <div className="text-center py-8 sm:py-12 border border-dashed rounded-lg bg-gray-50">
          <UserCog className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-700">
            No Assistants Yet
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4 px-4">
            Add your first medical assistant to get started
          </p>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Assistant
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {assistants.map((assistant) => {
            const validDoctors = assistant.doctorsAssigned.filter((doctorId) =>
              doctors.some((doctor) => doctor.id === doctorId)
            );

            const assignedDoctorNames = validDoctors
              .map((doctorId) => doctors.find((d) => d.id === doctorId)?.name)
              .filter(Boolean);

            // For mobile displays, limit the text length
            const displayEmail = screenSize.isMobile
              ? truncateText(assistant.email, 20)
              : assistant.email;

            const displayDoctors = screenSize.isMobile
              ? truncateText(assignedDoctorNames.join(", "), 25)
              : assignedDoctorNames.join(", ");

            return (
              <Card
                key={assistant.id}
                className="overflow-hidden transition-all hover:shadow-md"
              >
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg sm:text-xl font-semibold truncate pr-2">
                      {assistant.name}
                    </h3>
                    <Badge
                      variant={validDoctors.length > 0 ? "default" : "outline"}
                      className="ml-1 whitespace-nowrap"
                    >
                      {validDoctors.length}{" "}
                      {screenSize.isMobile ? "doc" : "doctor"}
                      {validDoctors.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pb-2 px-4 sm:px-6">
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{displayEmail}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 text-gray-400" />
                      {assistant.phone}
                    </p>

                    {/* Assigned Doctors */}
                    <div className="flex items-start mt-1">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 text-gray-400 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">
                          Assigned Doctors
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {assignedDoctorNames.length > 0
                            ? displayDoctors
                            : "No doctors assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between pt-2 px-4 sm:px-6 border-t bg-gray-50">
                  <Button
                    onClick={() => {
                      setSelectedAssistant(assistant);
                      setNewAssistant({
                        ...assistant,
                        doctorsAssigned: validDoctors,
                      });
                      setIsDialogOpen(true);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 h-8 text-xs sm:text-sm"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete ${assistant.name}?`
                        )
                      ) {
                        deleteAssistant(assistant.id);
                        toast({
                          title: "Assistant Deleted",
                          description: `${assistant.name} has been removed.`,
                        });
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 h-8 text-xs sm:text-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog for Adding or Editing Assistants */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-1">
            <DialogTitle>
              {selectedAssistant ? "Edit Assistant" : "Add New Assistant"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-3 -mr-3">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="Sarah Johnson"
                  value={newAssistant.name}
                  onChange={(e) =>
                    setNewAssistant({ ...newAssistant, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  placeholder="sarah@example.com"
                  type="email"
                  value={newAssistant.email}
                  onChange={(e) =>
                    setNewAssistant({ ...newAssistant, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                  value={newAssistant.phone}
                  onChange={(e) =>
                    setNewAssistant({ ...newAssistant, phone: e.target.value })
                  }
                />
              </div>

              {/* Assign Doctors using DropdownMenu */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Doctors</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start font-normal text-gray-700 text-sm"
                    >
                      {newAssistant.doctorsAssigned.length > 0
                        ? `${newAssistant.doctorsAssigned.length} doctor${
                            newAssistant.doctorsAssigned.length !== 1 ? "s" : ""
                          } selected`
                        : "Select doctors to assign"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-52 sm:w-56 max-h-60 overflow-auto"
                  >
                    {doctors.length === 0 ? (
                      <div className="px-2 py-4 text-sm text-center text-gray-500">
                        No doctors available
                      </div>
                    ) : (
                      doctors.map((doctor) => (
                        <DropdownMenuCheckboxItem
                          key={doctor.id}
                          checked={newAssistant.doctorsAssigned.includes(
                            doctor.id
                          )}
                          onCheckedChange={(checked) => {
                            setNewAssistant((prev) => ({
                              ...prev,
                              doctorsAssigned: checked
                                ? [...prev.doctorsAssigned, doctor.id]
                                : prev.doctorsAssigned.filter(
                                    (id) => id !== doctor.id
                                  ),
                            }));
                          }}
                          className="text-sm"
                        >
                          {doctor.name}
                        </DropdownMenuCheckboxItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Show selected doctors */}
                {newAssistant.doctorsAssigned.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {newAssistant.doctorsAssigned.map((doctorId) => {
                      const doctor = doctors.find((d) => d.id === doctorId);
                      return doctor ? (
                        <Badge
                          key={doctorId}
                          variant="secondary"
                          className="gap-1 text-xs py-1"
                        >
                          {truncateText(
                            doctor.name,
                            screenSize.isMobile ? 15 : 25
                          )}
                          <button
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => {
                              setNewAssistant((prev) => ({
                                ...prev,
                                doctorsAssigned: prev.doctorsAssigned.filter(
                                  (id) => id !== doctorId
                                ),
                              }));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="sm:mr-2 w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAssistant}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {selectedAssistant ? "Save Changes" : "Add Assistant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssistantsList;
