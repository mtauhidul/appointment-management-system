"use client";

import { AppSidebar } from "@/components/app-sidebar";
import Appointments from "@/components/patient/appointments/appointments";
import Dashboard from "@/components/patient/dashboard/dashboard";
import Kiosk from "@/components/patient/kiosk/kiosk";
import Profile from "@/components/patient/profile/profile";
import Reports from "@/components/patient/reports/reports";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  CalendarDays,
  ClipboardPlus,
  LayoutDashboard,
  SquareUser,
  Text,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard },
  { title: "Reports", icon: ClipboardPlus },
  { title: "Appointments", icon: CalendarDays },
  { title: "Profile", icon: SquareUser },
  { title: "Kiosk", icon: Text },
];

const componentMapping: { [key: string]: JSX.Element } = {
  Dashboard: <Dashboard />,
  Reports: <Reports />,
  Appointments: <Appointments />,
  Profile: <Profile />,
  Kiosk: <Kiosk />,
};

export default function Patient() {
  const [section, setSection] = useState<string>("Dashboard");

  return (
    <SidebarProvider>
      <AppSidebar
        items={navItems}
        section={section}
        onSectionChange={setSection}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-all ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    onClick={() => setSection("Dashboard")}
                    className="cursor-pointer"
                  >
                    Patient
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{section}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {componentMapping[section as keyof typeof componentMapping]}
      </SidebarInset>
    </SidebarProvider>
  );
}
