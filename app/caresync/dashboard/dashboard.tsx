import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PopoverClose } from "@radix-ui/react-popover";
import { Bell, Clock, Minus, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";

type Room = {
  id: number;
  number: number;
  status:
    | "Doctor IN"
    | "Patient Ready"
    | "Need Assistant"
    | "Cleaning Room"
    | "Empty";
  timeRemaining: string;
  isEmergency: boolean;
  patientName?: string | null;
  statusTime: number; // Timestamp of the last status change
};

type Doctor = {
  id: number;
  name: string;
  specialization: string;
  rooms: Room[];
  patientCount: number;
};

const statusColors: { [key: string]: string } = {
  "Doctor IN": "bg-green-100 border-green-500",
  "Patient Ready": "bg-blue-100 border-blue-500",
  "Need Assistant": "bg-red-100 border-red-500",
  "Cleaning Room": "bg-yellow-100 border-yellow-500",
  Empty: "bg-gray-100 border-gray-300",
};

const Dashboard = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: 1,
      name: "Dr. Emily Nguyen",
      specialization: "Pediatrician",
      rooms: [
        {
          id: 1,
          number: 10,
          status: "Doctor IN",
          timeRemaining: "2:20",
          isEmergency: false,
          patientName: "Alice",
          statusTime: Date.now() - 300000,
        },
        {
          id: 2,
          number: 11,
          status: "Patient Ready",
          timeRemaining: "2:20",
          isEmergency: false,
          patientName: "Bob",
          statusTime: Date.now() - 200000,
        },
        {
          id: 3,
          number: 12,
          status: "Patient Ready",
          timeRemaining: "1:30",
          isEmergency: true,
          statusTime: Date.now() - 400000,
        },
        {
          id: 4,
          number: 13,
          status: "Cleaning Room",
          timeRemaining: "0:45",
          isEmergency: false,
          statusTime: Date.now() - 500000,
        },
        {
          id: 5,
          number: 14,
          status: "Empty",
          timeRemaining: "0:00",
          isEmergency: false,
          statusTime: 0,
        },
      ],
      patientCount: 5,
    },
    {
      id: 2,
      name: "Dr. John Doe",
      specialization: "Cardiologist",
      rooms: [
        {
          id: 6,
          number: 20,
          status: "Doctor IN",
          timeRemaining: "1:20",
          isEmergency: false,
          patientName: "Charlie",
          statusTime: Date.now() - 600000,
        },
        {
          id: 7,
          number: 21,
          status: "Patient Ready",
          timeRemaining: "1:20",
          isEmergency: false,
          patientName: "David",
          statusTime: Date.now() - 700000,
        },
        {
          id: 8,
          number: 22,
          status: "Need Assistant",
          timeRemaining: "0:45",
          isEmergency: false,
          patientName: "Eve",
          statusTime: Date.now() - 800000,
        },
      ],
      patientCount: 3,
    },
  ]);

  const statuses = [
    "Doctor IN",
    "Patient Ready",
    "Need Assistant",
    "Cleaning Room",
    "Empty",
  ];

  const handleRoomReset = (doctorId: number, roomId: number) => {
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor.id === doctorId
          ? {
              ...doctor,
              rooms: doctor.rooms.map((room) =>
                room.id === roomId
                  ? {
                      ...room,
                      status: "Empty",
                      timeRemaining: "0:00",
                      isEmergency: false,
                      patientName: null,
                      statusTime: 0,
                    }
                  : room
              ),
            }
          : doctor
      )
    );
  };

  const handleToggleEmergency = (doctorId: number, roomId: number) => {
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor.id === doctorId
          ? {
              ...doctor,
              rooms: doctor.rooms.map((room) =>
                room.id === roomId && room.status !== "Empty"
                  ? { ...room, isEmergency: !room.isEmergency }
                  : room
              ),
            }
          : doctor
      )
    );
  };

  const handleUpdateStatus = (
    doctorId: number,
    roomId: number,
    newStatus: Room["status"]
  ) => {
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor.id === doctorId
          ? {
              ...doctor,
              rooms: doctor.rooms.map((room) =>
                room.id === roomId
                  ? {
                      ...room,
                      status: newStatus,
                      isEmergency: false,
                      statusTime: Date.now(),
                    }
                  : room
              ),
            }
          : doctor
      )
    );
  };

  const handlePatientCountChange = (doctorId: number, delta: number) => {
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor.id === doctorId
          ? {
              ...doctor,
              patientCount: Math.max(0, doctor.patientCount + delta),
            }
          : doctor
      )
    );
  };

  return (
    <div className="p-4 space-y-4">
      {doctors.map((doctor) => (
        <div
          key={doctor.id}
          className="space-y-4 bg-white p-4 rounded-lg shadow-lg"
        >
          {/* Doctor Info */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{doctor.name}</h2>
              <p className="text-sm text-primary">{doctor.specialization}</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      doctor.rooms.forEach((room) =>
                        handleRoomReset(doctor.id, room.id)
                      )
                    }
                  >
                    Reset All
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>Reset all rooms for {doctor.name}</TooltipContent>
            </Tooltip>
          </div>

          {/* Patient Count */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-inner">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePatientCountChange(doctor.id, -1)}
              disabled={doctor.patientCount === 0}
            >
              <Minus className="w-5 h-5 text-red-500" />
            </Button>
            <span className="text-lg font-semibold">
              {doctor.patientCount} Patients
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePatientCountChange(doctor.id, 1)}
            >
              <Plus className="w-5 h-5 text-green-500" />
            </Button>
          </div>

          {/* Room Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {doctor.rooms.map((room) => {
              const sameStatusRooms = doctor.rooms
                .filter((r) => r.status === room.status && r.status !== "Empty")
                .sort((a, b) => a.statusTime - b.statusTime);
              const serialNumber =
                sameStatusRooms.findIndex((r) => r.id === room.id) + 1;

              return (
                <div
                  key={room.id}
                  className={`p-3 rounded-lg shadow-md flex flex-col items-center relative min-w-[200px] ${
                    room.isEmergency
                      ? "bg-red-200 border-red-500 animate-pulse"
                      : statusColors[room.status]
                  }`}
                >
                  {/* Room Header */}
                  <div className="flex justify-between w-full">
                    <span className="text-lg font-bold">{room.number}</span>
                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleToggleEmergency(doctor.id, room.id)
                              }
                              disabled={room.status === "Empty"}
                            >
                              <Bell
                                className={`w-5 h-5 ${
                                  room.isEmergency
                                    ? "text-red-500"
                                    : "text-gray-500"
                                }`}
                              />
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {room.isEmergency
                            ? "Disable Emergency"
                            : "Enable Emergency"}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRoomReset(doctor.id, room.id)
                              }
                            >
                              <RotateCcw className="w-5 h-5 text-gray-500" />
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Reset Room</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <div>
                        <Button
                          variant="outline"
                          className="mt-2 px-3 py-1 text-sm rounded-full bg-white shadow-md font-semibold text-gray-800 flex items-center"
                        >
                          {room.status !== "Empty" && (
                            <span className="text-white font-bold bg-blue-600 w-6 h-6 flex items-center justify-center rounded-full shadow-lg text-lg mr-2">
                              {serialNumber}
                            </span>
                          )}
                          {room.status}
                        </Button>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-3 bg-white shadow-lg rounded-lg space-y-2">
                      {statuses.map((status) => (
                        <PopoverClose asChild key={status}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-left hover:bg-gray-100"
                            onClick={() =>
                              handleUpdateStatus(
                                doctor.id,
                                room.id,
                                status as Room["status"]
                              )
                            }
                          >
                            {status}
                          </Button>
                        </PopoverClose>
                      ))}
                    </PopoverContent>
                  </Popover>

                  {/* Patient Info */}
                  <p className="text-sm text-gray-700 mt-2">
                    {room.patientName || "No Patient"}
                  </p>

                  {/* Timer */}
                  <div className="mt-3 flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{room.timeRemaining}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
