import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useReceptionistStore } from "@/lib/store/useReceptionistStore";
import { Edit, Mail, Phone, Trash2 } from "lucide-react";
import { useState } from "react";

const ReceptionistsList = () => {
  const {
    receptionists,
    addReceptionist,
    updateReceptionist,
    deleteReceptionist,
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

  const handleSaveReceptionist = () => {
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

    if (selectedReceptionist) {
      updateReceptionist(selectedReceptionist.id, newReceptionist);
      toast({
        title: "Receptionist Updated",
        description: `${newReceptionist.name} has been updated.`,
      });
    } else {
      addReceptionist({
        id: Math.random().toString(36).substr(2, 9),
        ...newReceptionist,
      });
      toast({
        title: "Receptionist Added",
        description: `${newReceptionist.name} has been added.`,
      });
    }

    setIsDialogOpen(false);
    setSelectedReceptionist(null);
    setNewReceptionist({ name: "", email: "", phone: "" });
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsDialogOpen(true)}>
        Add New Receptionist
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {receptionists.map((receptionist) => (
          <div
            key={receptionist.id}
            className="p-6 border rounded-lg shadow-md bg-white"
          >
            <h3 className="text-xl font-semibold">{receptionist.name}</h3>
            <p className="text-sm text-gray-500 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              {receptionist.email}
            </p>
            <p className="text-sm text-gray-500 flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              {receptionist.phone}
            </p>

            <div className="flex space-x-2 mt-3">
              <Button
                onClick={() => {
                  setSelectedReceptionist(receptionist);
                  setNewReceptionist(receptionist);
                  setIsDialogOpen(true);
                }}
                variant="outline"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => {
                  deleteReceptionist(receptionist.id);
                  toast({
                    variant: "destructive",
                    title: "Receptionist Deleted",
                    description: `${receptionist.name} has been removed.`,
                  });
                }}
                variant="outline"
                className="text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedReceptionist ? "Edit Receptionist" : "Add Receptionist"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={newReceptionist.name}
              onChange={(e) =>
                setNewReceptionist({ ...newReceptionist, name: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              type="email"
              value={newReceptionist.email}
              onChange={(e) =>
                setNewReceptionist({
                  ...newReceptionist,
                  email: e.target.value,
                })
              }
            />
            <Input
              placeholder="Phone"
              type="tel"
              value={newReceptionist.phone}
              onChange={(e) =>
                setNewReceptionist({
                  ...newReceptionist,
                  phone: e.target.value,
                })
              }
            />

            <Button onClick={handleSaveReceptionist} className="w-full">
              {selectedReceptionist ? "Save Changes" : "Add Receptionist"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceptionistsList;
