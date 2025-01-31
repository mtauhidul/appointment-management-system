import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  BellIcon,
  CheckCircle2,
  ClockIcon,
  X,
} from "lucide-react";
import { useState } from "react";

type Notification = {
  id: string;
  type: "appointment" | "result" | "alert" | "reminder";
  message: string;
  date: Date;
  read: boolean;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "appointment",
      message: "Upcoming appointment with Dr. Smith on March 15 at 10:00 AM",
      date: new Date("2024-03-10"),
      read: false,
    },
    {
      id: "2",
      type: "result",
      message: "New lab results available for your recent blood test",
      date: new Date("2024-03-09"),
      read: false,
    },
    {
      id: "3",
      type: "alert",
      message: "Prescription refill required for Metformin",
      date: new Date("2024-03-08"),
      read: true,
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "appointment":
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case "result":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "reminder":
        return <BellIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <BellIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-4 p-4 rounded-lg ${
            !notification.read ? "bg-muted/50" : ""
          }`}
        >
          <div className="mt-1">{getIcon(notification.type)}</div>
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {notification.date.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => markAsRead(notification.id)}
            >
              <span className="sr-only">Mark as read</span>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
