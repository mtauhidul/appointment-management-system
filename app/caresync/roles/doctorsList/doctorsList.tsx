import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAssistantStore } from "@/lib/store/useAssistantStore";
import { useDoctorStore } from "@/lib/store/useDoctorStore";
import { useRoomStore } from "@/lib/store/useRoomStore"; // ✅ Fetch assigned rooms dynamically
import { Briefcase, Edit, Mail, Phone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const DoctorsList = () => {
  const { doctors, addDoctor, updateDoctor, deleteDoctor } = useDoctorStore();
  const { assistants } = useAssistantStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const { rooms } = useRoomStore(); // ✅ Get updated rooms from store
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string } | null>(
    null
  );
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
  });

  useEffect(() => {
    if (isUpdating) return;

    setIsUpdating(true);
    doctors.forEach((doctor) => {
      const assignedRoomIds = rooms
        .filter((room) => room.doctorsAssigned.includes(doctor.id))
        .map((room) => room.number.toString());

      if (
        JSON.stringify(doctor.roomsAssigned.sort()) !==
        JSON.stringify(assignedRoomIds.sort())
      ) {
        updateDoctor(doctor.id, { roomsAssigned: assignedRoomIds });
      }
    });
    setIsUpdating(false);
  }, [rooms]);

  const handleSaveDoctor = () => {
    if (
      !newDoctor.name ||
      !newDoctor.email ||
      !newDoctor.phone ||
      !newDoctor.specialty
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All fields are required!",
      });
      return;
    }

    if (selectedDoctor) {
      updateDoctor(selectedDoctor.id, newDoctor);
      toast({
        title: "Doctor Updated",
        description: `${newDoctor.name} has been updated.`,
      });
    } else {
      addDoctor({
        id: Math.random().toString(36).substr(2, 9),
        ...newDoctor,
        roomsAssigned: [],
        assistantsAssigned: [],
        patients: [],
      });
      toast({
        title: "Doctor Added",
        description: `${newDoctor.name} has been added.`,
      });
    }

    setIsDialogOpen(false);
    setSelectedDoctor(null);
    setNewDoctor({ name: "", email: "", phone: "", specialty: "" });
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsDialogOpen(true)}>Add New Doctor</Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doctor) => {
          // ✅ Get dynamically assigned assistants
          const assignedAssistants = assistants.filter((a) =>
            a.doctorsAssigned.includes(doctor.id)
          );

          return (
            <div
              key={doctor.id}
              className="p-6 border rounded-lg shadow-md bg-white"
            >
              <h3 className="text-xl font-semibold">{doctor.name}</h3>
              <p className="text-sm text-primary flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                {doctor.specialty}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {doctor.email}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {doctor.phone}
              </p>

              {/* ✅ Assigned Assistants */}
              <p className="text-sm text-gray-700">
                <span className="font-medium">Assigned Assistants:</span>{" "}
                <span className="text-gray-500">
                  {assignedAssistants.length > 0
                    ? assignedAssistants.map((a) => a.name).join(", ")
                    : "None"}
                </span>
              </p>

              {/* ✅ Assigned Rooms (Updated Dynamically) */}
              <p className="text-sm text-gray-700">
                <span className="font-medium">Assigned Rooms:</span>{" "}
                <span className="text-gray-500">
                  {doctor.roomsAssigned.length
                    ? doctor.roomsAssigned.join(", ")
                    : "None"}
                </span>
              </p>

              <div className="flex space-x-2 mt-3">
                <Button
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setNewDoctor(doctor);
                    setIsDialogOpen(true);
                  }}
                  variant="outline"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    deleteDoctor(doctor.id);
                    toast({
                      variant: "destructive",
                      title: "Doctor Deleted",
                      description: `${doctor.name} has been removed.`,
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
              {selectedDoctor ? "Edit Doctor" : "Add Doctor"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={newDoctor.name}
              onChange={(e) =>
                setNewDoctor({ ...newDoctor, name: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              type="email"
              value={newDoctor.email}
              onChange={(e) =>
                setNewDoctor({ ...newDoctor, email: e.target.value })
              }
            />
            <Input
              placeholder="Phone"
              type="tel"
              value={newDoctor.phone}
              onChange={(e) =>
                setNewDoctor({ ...newDoctor, phone: e.target.value })
              }
            />
            <Input
              placeholder="Specialty"
              value={newDoctor.specialty}
              onChange={(e) =>
                setNewDoctor({ ...newDoctor, specialty: e.target.value })
              }
            />
            <Button onClick={handleSaveDoctor} className="w-full">
              {selectedDoctor ? "Save Changes" : "Add Doctor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorsList;
