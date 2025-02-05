"use client";

import { AppSidebar } from "@/components/app-sidebar";
import Dashboard from "@/components/caresync/dashboard/dashboard";
import Patients from "@/components/caresync/patients/page";
import Reports from "@/components/caresync/reports/page";
import Resources from "@/components/caresync/resources/page";
import Roles from "@/components/caresync/roles/page";
import Status from "@/components/caresync/status/page";
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
  ChartNoAxesCombined,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  SquareCheckBig,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function Caresync() {
  const [section, setSection] = useState("Dashboard");

  const sidebarItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      isActive: section === "Dashboard",
    },
    {
      title: "Patients",
      icon: Users,
      isActive: section === "Patients",
    },
    {
      title: "Reports",
      icon: ChartNoAxesCombined,
      isActive: section === "Reports",
    },
    {
      title: "Roles",
      icon: ShieldCheck,
      isActive: section === "Roles",
    },
    {
      title: "Status",
      icon: SquareCheckBig,
      isActive: section === "Status",
    },
    {
      title: "Resources",
      icon: Layers,
      isActive: section === "Resources",
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar
        items={sidebarItems}
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
                    Caresync
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
        {section === "Dashboard" && <Dashboard />}
        {section === "Patients" && <Patients />}
        {section === "Reports" && <Reports />}
        {section === "Roles" && <Roles />}
        {section === "Status" && <Status />}
        {section === "Resources" && <Resources />}
      </SidebarInset>
    </SidebarProvider>
  );
}
