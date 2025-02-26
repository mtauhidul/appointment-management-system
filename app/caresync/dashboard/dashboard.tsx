"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDoctorStore } from "@/lib/store/useDoctorStore";
import { useRoomStore } from "@/lib/store/useRoomStore";
import { useStatusStore } from "@/lib/store/useStatusStore";
import { PopoverClose } from "@radix-ui/react-popover";
import { Bell, Clock, Minus, Plus, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { doctors } = useDoctorStore();
  const { rooms, updateRoom } = useRoomStore();
  const { statuses } = useStatusStore();

  // ✅ Generate a map of status colors dynamically from store
  const statusColors = statuses.reduce(
    (acc: { [key: string]: string }, status) => {
      acc[status.name] = status.color || "#e5e7eb"; // Default light gray
      return acc;
    },
    {}
  );

  // ✅ Timer state to track elapsed time for each doctor’s assigned rooms
  const [timers, setTimers] = useState<{
    [key: string]: { [doctorId: string]: number };
  }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const newTimers = { ...prev };

        rooms.forEach((room) => {
          Object.keys(room.doctorStatuses || {}).forEach((doctorId) => {
            if (room.doctorStatuses[doctorId].status !== "Empty") {
              newTimers[room.id] = {
                ...newTimers[room.id],
                [doctorId]: Math.floor(
                  (Date.now() -
                    new Date(
                      room.doctorStatuses[doctorId].statusTime
                    ).getTime()) /
                    1000
                ),
              };
            } else {
              newTimers[room.id] = { ...newTimers[room.id], [doctorId]: 0 };
            }
          });
        });

        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rooms]);

  // ✅ Reset Room (specific to doctor)
  const handleRoomReset = (roomId: string, doctorId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    updateRoom(roomId, {
      doctorStatuses: {
        ...room.doctorStatuses,
        [doctorId]: {
          status: "Empty",
          statusOrder: 0,
          statusTime: 0,
        },
      },
    });
  };

  // ✅ Reset all rooms under a specific doctor
  const handleResetAllRooms = (doctorId: string) => {
    rooms
      .filter((room) =>
        doctors
          .find((doc) => doc.id === doctorId)
          ?.roomsAssigned.includes(room.id)
      )
      .forEach((room) => handleRoomReset(room.id, doctorId));
  };

  // ✅ Function to play notification sound when a status with sound is applied
  const playNotificationSound = () => {
    const audio = new Audio("/sounds/beep.mp3"); // Ensure file exists
    audio.play().catch((err) => console.error("Audio play failed:", err));
  };

  // ✅ Function to play emergency sound
  const playEmergencySound = () => {
    const audio = new Audio("/sounds/emergency.mp3"); // Ensure file exists
    audio.play().catch((err) => console.error("Audio play failed:", err));
  };

  // ✅ Update Room Status and trigger sound if needed (specific to doctor)
  const handleUpdateStatus = (
    roomId: string,
    doctorId: string,
    newStatus: string
  ) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const updatedDoctorStatuses = {
      ...room.doctorStatuses,
      [doctorId]: {
        status: newStatus,
        statusOrder:
          Object.values(room.doctorStatuses || {}).filter(
            (ds) => ds.status === newStatus
          ).length + 1,
        statusTime: Date.now(),
      },
    };

    updateRoom(roomId, {
      ...room,
      doctorStatuses: updatedDoctorStatuses,
    });

    // ✅ Check if the new status requires sound
    const statusObject = statuses.find((s) => s.name === newStatus);
    if (statusObject?.hasSound) {
      playNotificationSound();
    }
  };

  // ✅ Toggle Emergency Mode and trigger emergency sound
  const handleToggleEmergency = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const newEmergencyState = !room.isEmergency;

    updateRoom(roomId, {
      isEmergency: newEmergencyState,
    });

    // 🔊 Play emergency sound **only when activated**
    if (newEmergencyState) {
      playEmergencySound();
    }
  };

  // ✅ Update Patient Count (specific to doctor)
  const handlePatientCountChange = (doctorId: string, count: number) => {
    const doctor = doctors.find((doc) => doc.id === doctorId);
    if (!doctor) return;

    const newCount = Math.max(0, doctor.patients.length + count);
    useDoctorStore.getState().updateDoctor(doctorId, {
      patients: new Array(newCount)
        .fill(null)
        .map((_, i) => `Patient ${i + 1}`),
    });
  };

  useEffect(() => {
    console.log(doctors);
  }, [doctors]);

  return (
    <div className="p-4 space-y-4">
      {doctors.map((doctor) => (
        <div
          key={doctor.id}
          className="space-y-4 bg-white p-4 rounded-lg shadow-lg"
        >
          <div className="flex flex-wrap items-center justify-between bg-white p-3 rounded-lg shadow-md gap-3 md:gap-6">
            {/* Left Section: Doctor Name & Specialty */}
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {doctor.name}
                </h2>
                <p className="text-xs text-primary">{doctor.specialty}</p>
              </div>
            </div>

            {/* Middle Section: Compact Patient Counter */}
            <div className="flex items-center bg-gray-50 p-2 rounded-lg shadow-inner gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePatientCountChange(doctor.id, -1)}
                disabled={doctor.patients.length === 0}
              >
                <Minus className="w-4 h-4 text-red-500" />
              </Button>
              <span className="text-sm font-semibold">
                {doctor.patients.length} Patients
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePatientCountChange(doctor.id, 1)}
              >
                <Plus className="w-4 h-4 text-green-500" />
              </Button>
            </div>

            {/* Right Section: Reset Button */}
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => handleResetAllRooms(doctor.id)}
            >
              Reset Rooms
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {rooms
              .filter((room) => doctor.roomsAssigned.includes(room.id))
              .map((room) => {
                const doctorRoomData = room.doctorStatuses?.[doctor.id] || {
                  status: "Empty",
                  statusOrder: 0,
                  statusTime: 0,
                };

                const roomColor = room.isEmergency
                  ? "#ffcccc"
                  : statusColors[doctorRoomData.status] || "#f3f4f6";
                const borderColor = room.isEmergency
                  ? "#ff0000"
                  : statusColors[doctorRoomData.status] || "#d1d5db";

                // Find the order of this room within its status group for the specific doctor
                const statusRooms = rooms
                  .filter(
                    (r) =>
                      r.doctorStatuses?.[doctor.id]?.status ===
                        doctorRoomData.status &&
                      r.doctorStatuses?.[doctor.id]?.status !== "Empty"
                  )
                  .sort(
                    (a, b) =>
                      new Date(
                        a.doctorStatuses?.[doctor.id]?.statusTime || 0
                      ).getTime() -
                      new Date(
                        b.doctorStatuses?.[doctor.id]?.statusTime || 0
                      ).getTime()
                  );

                const statusOrder =
                  statusRooms.findIndex((r) => r.id === room.id) + 1;

                return (
                  <div
                    key={room.id}
                    className={`p-2 rounded-lg shadow-md flex flex-col items-center relative min-w-[160px] transition-all duration-300 ${
                      room.isEmergency ? "animate-pulse bg-red-300" : "bg-white"
                    }`}
                    style={{
                      backgroundColor: roomColor,
                      border: `1.5px solid ${borderColor}`,
                    }}
                  >
                    {/* Room Header */}
                    <div className="flex justify-between w-full">
                      <span className="text-md font-semibold">
                        {room.number}
                      </span>
                      <div className="flex space-x-2">
                        {/* Emergency Button */}
                        <Button
                          disabled={doctorRoomData.status === "Empty"}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleEmergency(room.id)}
                          className={`${
                            room.isEmergency
                              ? "animate-pulse text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          <Bell className="w-4 h-4" />
                        </Button>

                        {/* Reset Button */}
                        <Button
                          disabled={
                            doctorRoomData.status === "Empty" ||
                            room.isEmergency
                          }
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRoomReset(room.id, doctor.id)}
                        >
                          <RotateCcw className="w-4 h-4 text-gray-500" />
                        </Button>
                      </div>
                    </div>

                    {/* Status with Order Number */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <div>
                          <Button
                            variant="outline"
                            className="mt-2 px-2 py-1 text-xs rounded-full bg-white shadow-md font-semibold text-gray-800 flex items-center"
                          >
                            {statusOrder > 0 && (
                              <span className="text-white font-bold bg-blue-600 w-5 h-5 flex items-center justify-center rounded-full shadow-lg text-xs -ml-1">
                                {statusOrder}
                              </span>
                            )}
                            {doctorRoomData.status}
                          </Button>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-2 bg-white shadow-lg rounded-lg space-y-2">
                        {statuses.map((status) => (
                          <PopoverClose asChild key={status.id}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-left hover:bg-gray-100 text-sm"
                              onClick={() =>
                                handleUpdateStatus(
                                  room.id,
                                  doctor.id,
                                  status.name
                                )
                              }
                            >
                              {status.name}
                            </Button>
                          </PopoverClose>
                        ))}
                      </PopoverContent>
                    </Popover>

                    {/* Patient Name */}
                    <p className="text-xs text-gray-600 mt-1">
                      {room.patientAssigned || "No Patient"}
                    </p>

                    {/* Timer */}
                    <div className="mt-2 flex items-center space-x-1 text-xs">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>
                        {timers[room.id] &&
                        timers[room.id][doctor.id] !== undefined
                          ? `${Math.floor(timers[room.id][doctor.id] / 60)}:${(
                              timers[room.id][doctor.id] % 60
                            )
                              .toString()
                              .padStart(2, "0")}`
                          : "00:00"}
                      </span>
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
