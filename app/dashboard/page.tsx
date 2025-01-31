"use client";
import { AppSidebar } from "@/components/app-sidebar";
import Appointments from "@/components/appointments/appointments";
import Dashboard from "@/components/dashboard/dashboard";
import Profile from "@/components/profile/profile";
import Reports from "@/components/reports/reports";
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
import React from "react";

export default function Page() {
  const [section, setSection] = React.useState("Dashboard");

  return (
    <SidebarProvider>
      <AppSidebar
        onSectionChange={(section: string) => setSection(section)}
        section={section}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
                    Dashboard
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
        {section === "Dashboard" ? <Dashboard /> : null}
        {section === "Reports" ? <Reports /> : null}
        {section === "Appointments" ? <Appointments /> : null}
        {section === "Profile" ? <Profile /> : null}
      </SidebarInset>
    </SidebarProvider>
  );
}
