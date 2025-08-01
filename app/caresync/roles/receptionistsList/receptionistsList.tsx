"use client";

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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useReceptionistStore } from "@/lib/store/useReceptionistStore";
import { Edit, Mail, Phone, Plus, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";

const ReceptionistsList = () => {
  const {
    receptionists,
    isLoading,
    addReceptionistToFirestore,
    updateReceptionistInFirestore,
    deleteReceptionistFromFirestore,
  } = useReceptionistStore();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReceptionist, setSelectedReceptionist] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null>(null);
  const [newReceptionist, setNewReceptionist] = useState({
    name: "",
    email: "",
    phone: "",
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

  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveReceptionist = async () => {
    if (
      !newReceptionist.name ||
      !newReceptionist.email ||
      !newReceptionist.phone
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All fields are required!",
      });
      return;
    }

    setIsUpdating(true);

    if (selectedReceptionist) {
      // Update existing receptionist in Firestore
      const success = await updateReceptionistInFirestore(selectedReceptionist.id, newReceptionist);
      
      if (success) {
        toast({
          title: "Receptionist Updated",
          description: `${newReceptionist.name} has been updated.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update receptionist. Please try again.",
        });
        setIsUpdating(false);
        return;
      }
    } else {
      // Create new receptionist in Firestore
      const success = await addReceptionistToFirestore(newReceptionist);
      
      if (success) {
        toast({
          title: "Receptionist Added",
          description: `${newReceptionist.name} has been added.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create receptionist. Please try again.",
        });
        setIsUpdating(false);
        return;
      }
    }

    setIsDialogOpen(false);
    resetForm();
    setIsUpdating(false);
  };

  const resetForm = () => {
    setNewReceptionist({ name: "", email: "", phone: "" });
    setSelectedReceptionist(null);
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
        <h2 className="text-xl sm:text-2xl font-bold">Receptionists</h2>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="w-full sm:w-auto gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Receptionist
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading receptionists...</p>
        </div>
      ) : receptionists.length === 0 ? (
        <div className="text-center py-8 sm:py-12 border border-dashed rounded-lg bg-gray-50">
          <User className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-700">
            No Receptionists Yet
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4 px-4">
            Add your first receptionist to get started
          </p>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Receptionist
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {receptionists.map((receptionist) => {
            // For mobile displays, limit the text length
            const displayEmail = screenSize.isMobile
              ? truncateText(receptionist.email, 20)
              : receptionist.email;

            return (
              <Card
                key={receptionist.id}
                className="overflow-hidden transition-all hover:shadow-md"
              >
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <h3 className="text-lg sm:text-xl font-semibold truncate">
                    {receptionist.name}
                  </h3>
                </CardHeader>

                <CardContent className="pb-3 px-4 sm:px-6">
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{displayEmail}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 text-gray-400" />
                      {receptionist.phone}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between pt-2 px-4 sm:px-6 border-t bg-gray-50">
                  <Button
                    onClick={() => {
                      setSelectedReceptionist(receptionist);
                      setNewReceptionist(receptionist);
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
                    onClick={async () => {
                      if (
                        confirm(
                          `Are you sure you want to delete ${receptionist.name}?`
                        )
                      ) {
                        const success = await deleteReceptionistFromFirestore(receptionist.id);
                        
                        if (success) {
                          toast({
                            title: "Receptionist Deleted",
                            description: `${receptionist.name} has been removed.`,
                          });
                        } else {
                          toast({
                            variant: "destructive",
                            title: "Error",
                            description: "Failed to delete receptionist. Please try again.",
                          });
                        }
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
              {selectedReceptionist
                ? "Edit Receptionist"
                : "Add New Receptionist"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-3 -mr-3">
            <div className="space-y-4 p-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="Jane Smith"
                  value={newReceptionist.name}
                  onChange={(e) =>
                    setNewReceptionist({
                      ...newReceptionist,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  placeholder="jane@example.com"
                  type="email"
                  value={newReceptionist.email}
                  onChange={(e) =>
                    setNewReceptionist({
                      ...newReceptionist,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                  value={newReceptionist.phone}
                  onChange={(e) =>
                    setNewReceptionist({
                      ...newReceptionist,
                      phone: e.target.value,
                    })
                  }
                />
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
              onClick={handleSaveReceptionist}
              className="w-full sm:w-auto order-1 sm:order-2"
              disabled={isUpdating}
            >
              {isUpdating ? (selectedReceptionist ? "Saving..." : "Adding...") : (selectedReceptionist ? "Save Changes" : "Add Receptionist")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceptionistsList;
