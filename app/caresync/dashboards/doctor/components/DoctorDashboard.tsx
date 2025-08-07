"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Clock4,
  DoorOpen,
  RotateCcw,
  UserCog,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import tinycolor from "tinycolor2";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PopoverClose } from "@radix-ui/react-popover";

import { useDoctorStore } from "@/lib/store/useDoctorStore";
import { useRoomStore } from "@/lib/store/useRoomStore";
import { useStatusStore } from "@/lib/store/useStatusStore";

// Helper to format time in MM:SS
const formatTime = (seconds: number) => {
  return `${Math.floor(seconds / 60)}:${(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
};

const DoctorDashboard = () => {
  // State for demo - in real app, this would come from auth/user context
  const [currentDoctorId, setCurrentDoctorId] = useState<string>("");
  
  const { doctors, isLoading: doctorsLoading } = useDoctorStore();
  const { rooms, isLoading: roomsLoading, updateRoomInFirestore } = useRoomStore();
  const { statuses } = useStatusStore();

  // Get current doctor (for demo, use first doctor; in real app, get from auth)
  const currentDoctor = doctors.find(d => d.id === currentDoctorId) || doctors[0];

  // Set current doctor ID when doctors load
  useEffect(() => {
    if (doctors.length > 0 && !currentDoctorId) {
      setCurrentDoctorId(doctors[0].id);
    }
  }, [doctors, currentDoctorId]);

  // Check if we're still loading data
  const isLoading = doctorsLoading || roomsLoading;

  // Prevent hydration mismatch by ensuring client-side mounting
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate status colors map
  const statusColors = statuses.reduce(
    (acc: { [key: string]: string }, status) => {
      acc[status.name] = status.color || "#e5e7eb";
      return acc;
    },
    {}
  );

  // Timers state for tracking elapsed time
  const [timers, setTimers] = useState<{
    [key: string]: { [doctorId: string]: number };
  }>({});

  // Update timers every second - only run on client after mounting
  useEffect(() => {
    if (!isMounted || !currentDoctor) return;

    const interval = setInterval(() => {
      setTimers((prev) => {
        const newTimers = { ...prev };

        rooms.forEach((room) => {
          if (room.doctorStatuses && room.doctorStatuses[currentDoctor.id] && 
              room.doctorStatuses[currentDoctor.id].status !== "Empty") {
            newTimers[room.id] = {
              ...newTimers[room.id],
              [currentDoctor.id]: Math.floor(
                (Date.now() -
                  new Date(
                    room.doctorStatuses[currentDoctor.id].statusTime
                  ).getTime()) /
                  1000
              ),
            };
          } else {
            newTimers[room.id] = { ...newTimers[room.id], [currentDoctor.id]: 0 };
          }
        });

        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rooms, isMounted, currentDoctor]);

  // Audio handlers
  const playNotificationSound = () => {
    const audio = new Audio("/sounds/beep.mp3");
    audio.play().catch((err) => console.error("Audio play failed:", err));
  };

  const playEmergencySound = () => {
    const audio = new Audio("/sounds/emergency.mp3");
    audio.play().catch((err) => console.error("Audio play failed:", err));
  };

  // Reset specific room for current doctor
  const handleRoomReset = async (roomId: string) => {
    if (!currentDoctor) return;
    
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    // Update Firestore
    const success = await updateRoomInFirestore(roomId, {
      doctorStatuses: {
        ...room.doctorStatuses,
        [currentDoctor.id]: {
          status: "Empty",
          statusOrder: 0,
          statusTime: 0,
        },
      },
    });

    if (!success) {
      console.error('Failed to reset room status');
    }
  };

  // Update room status for current doctor
  const handleUpdateStatus = async (
    roomId: string,
    newStatus: string
  ) => {
    if (!currentDoctor) return;
    
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const updatedDoctorStatuses = {
      ...room.doctorStatuses,
      [currentDoctor.id]: {
        status: newStatus,
        statusOrder:
          Object.values(room.doctorStatuses || {}).filter(
            (ds) => ds.status === newStatus
          ).length + 1,
        statusTime: Date.now(),
      },
    };

    // Update Firestore
    const success = await updateRoomInFirestore(roomId, {
      doctorStatuses: updatedDoctorStatuses,
    });

    if (success) {
      // Play sound if status has sound enabled
      const statusObject = statuses.find((s) => s.name === newStatus);
      if (statusObject?.hasSound) {
        playNotificationSound();
      }
    } else {
      console.error('Failed to update room status');
    }
  };

  // Toggle emergency mode for a room
  const handleToggleEmergency = async (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const newEmergencyState = !room.isEmergency;
    
    // Update Firestore
    const success = await updateRoomInFirestore(roomId, { 
      isEmergency: newEmergencyState 
    });

    if (success) {
      // Play emergency sound only when activated
      if (newEmergencyState) {
        playEmergencySound();
      }
    } else {
      console.error('Failed to toggle emergency state');
    }
  };

  // Skeleton loading component for dashboard
  const DashboardSkeleton = () => (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-background p-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <Card key={j} className="overflow-hidden">
                <CardHeader className="py-2 px-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-7 w-7 rounded" />
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </CardContent>
                <CardFooter className="p-2 border-t">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="container mx-auto p-4">
      <div className="text-center py-16 space-y-6">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <Users className="h-12 w-12 text-gray-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            No Rooms Assigned
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You don&apos;t have any rooms assigned yet. Contact your administrator to get room assignments.
          </p>
        </div>
      </div>
    </div>
  );

  // Early return for loading state
  if (isLoading) {
    return (
      <TooltipProvider>
        <DashboardSkeleton />
      </TooltipProvider>
    );
  }

  // Early return if no current doctor
  if (!currentDoctor) {
    return (
      <TooltipProvider>
        <EmptyState />
      </TooltipProvider>
    );
  }

  // Get rooms assigned to current doctor
  const doctorRooms = rooms.filter((room) => 
    currentDoctor.roomsAssigned.includes(room.id)
  );

  // Early return for empty state
  if (doctorRooms.length === 0) {
    return (
      <TooltipProvider>
        <EmptyState />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 space-y-6">        
        <Card className="overflow-hidden">
          <CardHeader className="bg-background p-4 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Doctor Info */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{currentDoctor.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {currentDoctor.specialty}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:ml-auto">
                {/* Patient Counter */}
                <div className="flex items-center bg-accent/50 p-2 rounded-lg gap-2 self-stretch">
                  <span className="text-sm font-medium min-w-[80px] text-center">
                    {currentDoctor.patients.length}{" "}
                    {currentDoctor.patients.length === 1 ? "Patient" : "Patients"}
                  </span>
                </div>

                {/* Room Count */}
                <div className="flex items-center bg-accent/50 p-2 rounded-lg gap-2 self-stretch">
                  <DoorOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {doctorRooms.length} {doctorRooms.length === 1 ? "Room" : "Rooms"}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {doctorRooms.map((room) => {
                const doctorRoomData = room.doctorStatuses?.[currentDoctor.id] || {
                  status: "Empty",
                  statusOrder: 0,
                  statusTime: 0,
                };

                // Enhanced room styling based on emergency and status
                const getCardStyles = () => {
                  // Emergency state takes priority
                  if (room.isEmergency) {
                    return {
                      backgroundColor: "#fff0f0",
                      borderColor: "#ff5555",
                      boxShadow: "0 0 0 1px rgba(255, 85, 85, 0.5)",
                    };
                  }

                  // Empty rooms get a neutral styling
                  if (doctorRoomData.status === "Empty") {
                    return {
                      backgroundColor: "#fafafa",
                      borderColor: "#e2e8f0",
                      boxShadow: "none",
                    };
                  }

                  // Get status color and create a subtle background variant
                  const statusColor =
                    statusColors[doctorRoomData.status] || "#e2e8f0";
                  const color = tinycolor(statusColor);

                  return {
                    backgroundColor: color.setAlpha(0.05).toRgbString(),
                    borderColor: statusColor,
                    boxShadow: `0 0 0 1px ${color
                      .setAlpha(0.2)
                      .toRgbString()}`,
                  };
                };

                const roomStyles = getCardStyles();

                // Determine order number within status group
                const statusRooms = doctorRooms
                  .filter(
                    (r) =>
                      r.doctorStatuses?.[currentDoctor.id]?.status ===
                        doctorRoomData.status &&
                      r.doctorStatuses?.[currentDoctor.id]?.status !== "Empty"
                  )
                  .sort(
                    (a, b) =>
                      new Date(
                        a.doctorStatuses?.[currentDoctor.id]?.statusTime || 0
                      ).getTime() -
                      new Date(
                        b.doctorStatuses?.[currentDoctor.id]?.statusTime || 0
                      ).getTime()
                  );

                const statusOrder =
                  doctorRoomData.status !== "Empty"
                    ? statusRooms.findIndex((r) => r.id === room.id) + 1
                    : 0;
                const timer = timers[room.id]?.[currentDoctor.id] || 0;

                return (
                  <Card
                    key={room.id}
                    className={`overflow-hidden transition-all duration-300 border-2 ${
                      room.isEmergency ? "animate-pulse border-red-500" : ""
                    }`}
                    style={{
                      backgroundColor: roomStyles.backgroundColor,
                      borderColor: roomStyles.borderColor,
                      boxShadow: roomStyles.boxShadow,
                    }}
                  >
                    <CardHeader className="py-2 px-3 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium text-sm">
                          Room {room.number}
                        </h3>
                      </div>

                      <div className="flex items-center space-x-1">
                        {/* Emergency Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              disabled={doctorRoomData.status === "Empty"}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleEmergency(room.id)}
                              className={`h-7 w-7 p-0 ${
                                room.isEmergency
                                  ? "text-red-500"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {room.isEmergency
                              ? "Cancel Emergency"
                              : "Signal Emergency"}
                          </TooltipContent>
                        </Tooltip>

                        {/* Reset Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              disabled={
                                doctorRoomData.status === "Empty" ||
                                room.isEmergency
                              }
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRoomReset(room.id)
                              }
                              className="h-7 w-7 p-0"
                            >
                              <RotateCcw className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reset Room</TooltipContent>
                        </Tooltip>
                      </div>
                    </CardHeader>

                    <CardContent className="py-2 px-3 flex flex-col items-center">
                      {/* Status Selector */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full relative justify-center gap-2"
                            style={{
                              borderLeftColor:
                                statusColors[doctorRoomData.status] ||
                                "#e2e8f0",
                              borderLeftWidth: "4px",
                              backgroundColor:
                                doctorRoomData.status === "Empty"
                                  ? "#f9fafb"
                                  : "#ffffff",
                            }}
                          >
                            {statusOrder > 0 && (
                              <Badge className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground rounded-full">
                                {statusOrder}
                              </Badge>
                            )}
                            {doctorRoomData.status === "Empty" && (
                              <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            {doctorRoomData.status === "Ready" && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            )}
                            {doctorRoomData.status === "Waiting" && (
                              <Clock4 className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            {doctorRoomData.status === "In Progress" && (
                              <UserCog className="h-3.5 w-3.5 text-blue-500" />
                            )}
                            <span className="font-medium">
                              {doctorRoomData.status}
                            </span>
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="p-1 w-48">
                          <div className="grid gap-1">
                            {statuses.map((status) => {
                              // Create a button background with very subtle color from status
                              const bgColor = tinycolor(status.color)
                                .setAlpha(0.08)
                                .toRgbString();
                              const hoverColor = tinycolor(status.color)
                                .setAlpha(0.15)
                                .toRgbString();

                              return (
                                <PopoverClose asChild key={status.id}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-left text-sm font-normal hover:bg-[--hover-color]"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        room.id,
                                        status.name
                                      )
                                    }
                                    style={
                                      {
                                        borderLeft: `3px solid ${status.color}`,
                                        paddingLeft: "10px",
                                        backgroundColor:
                                          doctorRoomData.status ===
                                          status.name
                                            ? bgColor
                                            : "transparent",
                                        "--hover-color": hoverColor,
                                      } as React.CSSProperties
                                    }
                                  >
                                    {status.name === "Empty" && (
                                      <DoorOpen className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    )}
                                    {status.name === "Ready" && (
                                      <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                    )}
                                    {status.name === "Waiting" && (
                                      <Clock4 className="h-3.5 w-3.5 mr-2 text-amber-500" />
                                    )}
                                    {status.name === "In Progress" && (
                                      <UserCog className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                    )}
                                    {status.name}
                                  </Button>
                                </PopoverClose>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Patient Name with badge */}
                      <div className="flex items-center justify-center mt-2">
                        {room.patientAssigned ? (
                          <Badge
                            variant="outline"
                            className="font-normal text-xs bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                          >
                            {room.patientAssigned}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No Patient Assigned
                          </span>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="p-2 flex justify-center items-center border-t bg-muted/30">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span
                          className={`${
                            // Highlight timer if more than 5 minutes and not empty
                            timer > 300 && doctorRoomData.status !== "Empty"
                              ? "text-amber-600 font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatTime(timer)}
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default DoctorDashboard;
