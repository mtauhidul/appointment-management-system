"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  ClipboardList,
  FileText,
  Heart,
  Home,
  Menu,
  MessageSquare,
  Settings,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/patient-portal",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Appointments",
    href: "/patient-portal/appointments",
    icon: <CalendarIcon className="h-5 w-5" />,
  },
  {
    title: "Medical Records",
    href: "/patient-portal/records",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Prescriptions",
    href: "/patient-portal/prescriptions",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: "Messages",
    href: "/patient-portal/messages",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: "Vitals",
    href: "/patient-portal/vitals",
    icon: <Heart className="h-5 w-5" />,
  },
  {
    title: "Profile",
    href: "/patient-portal/profile",
    icon: <User className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/patient-portal/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

interface PatientPortalSidebarProps {
  isMobile: boolean;
}

export default function PatientPortalSidebar({
  isMobile,
}: PatientPortalSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button - only shown on mobile */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {/* Desktop sidebar - always rendered on desktop */}
      {!isMobile && (
        <div className="h-full flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2 px-2 py-4">
            <div className="bg-primary/10 p-1 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">MediConnect</h2>
              <p className="text-xs text-muted-foreground">Patient Portal</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-4 px-2 py-4">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                TU
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">Test User</div>
              <div className="text-xs text-muted-foreground">
                test.user@example.com
              </div>
            </div>
          </div>

          <Separator />

          <nav className="space-y-1 py-4 flex-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>

          <Separator />

          <Button className="mt-auto" variant="secondary">
            Sign Out
          </Button>
        </div>
      )}

      {/* Mobile sidebar - toggles visibility */}
      {isMobile && (
        <>
          {/* Sidebar container */}
          <div
            className={cn(
              "fixed top-0 left-0 z-40 h-screen w-64 bg-background border-r transform transition-transform duration-200 ease-in-out",
              isOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="h-full flex flex-col gap-2 p-4 pt-16">
              <div className="flex items-center gap-4 px-2 py-4">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    TU
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Test User</div>
                  <div className="text-xs text-muted-foreground">
                    test.user@example.com
                  </div>
                </div>
              </div>

              <Separator />

              <nav className="space-y-1 py-4 flex-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>

              <Separator />

              <Button className="mt-auto" variant="secondary">
                Sign Out
              </Button>
            </div>
          </div>

          {/* Backdrop - only shown when sidebar is open */}
          {isOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
          )}
        </>
      )}
    </>
  );
}
