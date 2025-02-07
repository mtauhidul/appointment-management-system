import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Briefcase, Edit, Mail, Phone, Trash2 } from "lucide-react";
import { useState } from "react";

type Role = {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization?: string; // For doctors only
  assignedRooms?: number[]; // For doctors
  assignedDoctor?: string; // For assistants
};

type RolesState = {
  doctors: Role[];
  assistants: Role[];
  receptionists: Role[];
};

const Roles = () => {
  const [roles, setRoles] = useState<RolesState>({
    doctors: [
      {
        id: 1,
        name: "Dr. John Doe",
        email: "john.doe@email.com",
        phone: "123-456-7890",
        specialization: "Cardiology",
        assignedRooms: [12, 13, 6],
      },
      {
        id: 2,
        name: "Dr. Shawn Michaels",
        email: "shawn.michaels@email.com",
        phone: "123-456-7890",
        specialization: "Neurology",
        assignedRooms: [8, 9, 10],
      },
    ],
    assistants: [
      {
        id: 1,
        name: "Jane Doe",
        email: "jane.doe@email.com",
        phone: "123-456-7890",
        assignedDoctor: "Dr. John Doe",
      },
      {
        id: 2,
        name: "Michael Jackson",
        email: "m.jack@email.com",
        phone: "123-456-7890",
        assignedDoctor: "Dr. Shawn Michaels",
      },
    ],
    receptionists: [
      {
        id: 1,
        name: "Adam Smith",
        email: "adam.s@email.com",
        phone: "123-456-7890",
      },
    ],
  });

  const [activeTab, setActiveTab] = useState<keyof RolesState>("doctors");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<Partial<Role>>({});
  const [searchQuery, setSearchQuery] = useState(""); // For search
  const [filterSpecialization, setFilterSpecialization] = useState(""); // For specialization filter

  const handleSaveRole = () => {
    // Validation and saving logic here...
  };

  const handleDeleteRole = (id: number) => {
    const updatedRoles: RolesState = { ...roles };
    updatedRoles[activeTab] = updatedRoles[activeTab].filter(
      (role: Role) => role.id !== id
    );
    setRoles(updatedRoles);
  };

  // Filter roles based on search and specialization (for doctors)
  const filteredRoles =
    activeTab === "doctors"
      ? roles.doctors.filter(
          (doctor) =>
            doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (!filterSpecialization ||
              doctor.specialization
                ?.toLowerCase()
                .includes(filterSpecialization.toLowerCase()))
        )
      : roles[activeTab].filter((role) =>
          role.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Roles</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          Add New{" "}
          {activeTab === "doctors"
            ? "Doctor"
            : activeTab === "assistants"
            ? "Assistant"
            : "Receptionist"}
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value: string) =>
          setActiveTab(value as keyof RolesState)
        }
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="assistants">Assistants</TabsTrigger>
          <TabsTrigger value="receptionists">Receptionists</TabsTrigger>
        </TabsList>

        {Object.keys(roles).map((tab) => (
          <TabsContent value={tab} key={tab}>
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex space-x-4">
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                {tab === "doctors" && (
                  <Input
                    placeholder="Filter by specialization..."
                    value={filterSpecialization}
                    onChange={(e) => setFilterSpecialization(e.target.value)}
                    className="flex-1"
                  />
                )}
              </div>

              {/* Role Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRoles.map((role) => (
                  <div
                    key={role.id}
                    className="p-4 border rounded-lg shadow-lg bg-white space-y-4"
                  >
                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold">{role.name}</h3>
                      <div className="flex space-x-2">
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsEditing(role);
                                setNewRole(role);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-red-500 hover:bg-red-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    {role.specialization && (
                      <p className="text-sm text-primary">
                        <Briefcase className="inline-block w-4 h-4 mr-2" />
                        {role.specialization}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      <Mail className="inline-block w-4 h-4 mr-2" />
                      {role.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      <Phone className="inline-block w-4 h-4 mr-2" />
                      {role.phone}
                    </p>
                    {role.assignedRooms && (
                      <p className="text-sm text-gray-700">
                        Assigned Rooms:{" "}
                        <span className="font-semibold">
                          {role.assignedRooms.join(", ") || "None"}
                        </span>
                      </p>
                    )}
                    {role.assignedDoctor && (
                      <p className="text-sm text-gray-700">
                        Assigned Doctor:{" "}
                        <span className="font-semibold">
                          {role.assignedDoctor}
                        </span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Role" : "Add Role"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={newRole.name || ""}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={newRole.email || ""}
              onChange={(e) =>
                setNewRole({ ...newRole, email: e.target.value })
              }
            />
            <Input
              placeholder="Phone"
              value={newRole.phone || ""}
              onChange={(e) =>
                setNewRole({ ...newRole, phone: e.target.value })
              }
            />
            {activeTab === "doctors" && (
              <Input
                placeholder="Specialization"
                value={newRole.specialization || ""}
                onChange={(e) =>
                  setNewRole({ ...newRole, specialization: e.target.value })
                }
              />
            )}
            {activeTab === "assistants" && (
              <select
                value={newRole.assignedDoctor || ""}
                onChange={(e) =>
                  setNewRole({ ...newRole, assignedDoctor: e.target.value })
                }
                className="w-full px-4 py-2 border rounded"
              >
                <option value="" disabled>
                  Assign to Doctor
                </option>
                {roles.doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.name}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <Button onClick={handleSaveRole} className="mt-4 w-full">
            {isEditing ? "Save Changes" : "Save"}
          </Button>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
};

export default Roles;
