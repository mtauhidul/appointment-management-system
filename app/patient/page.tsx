"use client";

import { AppSidebar } from "@/components/app-sidebar";
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
import { LayoutDashboard, SquareUser } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Dashboard from "./dashboard/dashboard";
import Profile from "./profile/profile";

function PatientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSection = searchParams.get("section");

  const [section, setSection] = useState<string>(() => {
    // If URL section is Kiosk, default to Appointments
    if (urlSection === "Kiosk") {
      return "Appointments";
    }
    return urlSection || "Appointments";
  });

  // Handle localStorage on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSection = localStorage.getItem("patient-section");
      if (!urlSection && savedSection && savedSection !== "Kiosk") {
        setSection(savedSection);
      } else if (savedSection === "Kiosk") {
        // If saved section was Kiosk, default to Appointments
        setSection("Appointments");
      }
    }
  }, [urlSection]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("patient-section", section);
    }
    router.replace(`?section=${section}`, { scroll: false });
  }, [section, router]);

  const sidebarItems = useMemo(
    () => [
      { title: "Appointments", icon: LayoutDashboard },
      { title: "Profile", icon: SquareUser },
    ],
    []
  );

  const componentMapping: { [key: string]: JSX.Element } = {
    Appointments: <Dashboard />,
    Profile: <Profile />,
  };

  return (
    <SidebarProvider>
      <AppSidebar
        items={sidebarItems.map((item) => ({
          ...item,
          isActive: section === item.title,
        }))}
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
                    onClick={() => setSection("Appointments")}
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

export default function Patient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PatientContent />
    </Suspense>
  );
}
