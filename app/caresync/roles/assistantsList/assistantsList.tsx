import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { useToast } from "@/hooks/use-toast";
import { useAssistantStore } from "@/lib/store/useAssistantStore";
import { useDoctorStore } from "@/lib/store/useDoctorStore";
import { Edit, Mail, Phone, Trash2 } from "lucide-react";
import { useState } from "react";

const AssistantsList = () => {
  const { assistants, addAssistant, updateAssistant, deleteAssistant } =
    useAssistantStore();
  const { doctors } = useDoctorStore();
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
        ), // Only keep valid doctor IDs
      });
      toast({
        title: "Assistant Updated",
        description: `${newAssistant.name} has been updated.`,
      });
    } else {
      addAssistant({
        id: Math.random().toString(36).substr(2, 9),
        ...newAssistant,
      });
      toast({
        title: "Assistant Added",
        description: `${newAssistant.name} has been added.`,
      });
    }

    setIsDialogOpen(false);
    setSelectedAssistant(null);
    setNewAssistant({ name: "", email: "", phone: "", doctorsAssigned: [] });
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsDialogOpen(true)}>Add New Assistant</Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assistants.map((assistant) => {
          const validDoctors = assistant.doctorsAssigned.filter((doctorId) =>
            doctors.some((doctor) => doctor.id === doctorId)
          );

          return (
            <div
              key={assistant.id}
              className="p-6 border rounded-lg shadow-md bg-white"
            >
              <h3 className="text-xl font-semibold">{assistant.name}</h3>
              <p className="text-sm text-gray-500 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {assistant.email}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {assistant.phone}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Assigned Doctors:</span>{" "}
                <span className="text-gray-500">
                  {validDoctors.length > 0
                    ? validDoctors
                        .map(
                          (doctorId) =>
                            doctors.find((d) => d.id === doctorId)?.name
                        )
                        .join(", ")
                    : "None"}
                </span>
              </p>

              <div className="flex space-x-2 mt-3">
                <Button
                  onClick={() => {
                    setSelectedAssistant(assistant);
                    setNewAssistant({
                      ...assistant,
                      doctorsAssigned: validDoctors,
                    });
                    setIsDialogOpen(true);
                  }}
                  variant="outline"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    deleteAssistant(assistant.id);
                    toast({
                      variant: "destructive",
                      title: "Assistant Deleted",
                      description: `${assistant.name} has been removed.`,
                    });
                  }}
                  variant="outline"
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAssistant ? "Edit Assistant" : "Add Assistant"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={newAssistant.name}
              onChange={(e) =>
                setNewAssistant({ ...newAssistant, name: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              type="email"
              value={newAssistant.email}
              onChange={(e) =>
                setNewAssistant({ ...newAssistant, email: e.target.value })
              }
            />
            <Input
              placeholder="Phone"
              type="tel"
              value={newAssistant.phone}
              onChange={(e) =>
                setNewAssistant({ ...newAssistant, phone: e.target.value })
              }
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full text-left">
                  {newAssistant.doctorsAssigned.length > 0
                    ? newAssistant.doctorsAssigned
                        .map(
                          (id) =>
                            doctors.find((d) => d.id === id)?.name || "Unknown"
                        )
                        .join(", ")
                    : "Assign Doctors"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {doctors.map((doctor) => (
                  <DropdownMenuCheckboxItem
                    key={doctor.id}
                    checked={newAssistant.doctorsAssigned.includes(doctor.id)}
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
                  >
                    {doctor.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleSaveAssistant} className="w-full">
              {selectedAssistant ? "Save Changes" : "Add Assistant"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssistantsList;
