"use client";

import {
  Home,
  LayoutDashboard,
  User,
  Users,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

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
import useDataLoader from "@/hooks/useDataLoader";

// Import dashboard components
import ReceptionistDashboard from "./components/ReceptionistDashboard";
import ReceptionistProfile from "./components/ReceptionistProfile";
import PatientsManagement from "@/components/patients-list";

// Import reports component from main dashboard
// We'll import the existing reports component for consistency
import ReportsComponent from "./components/ReceptionistReports";

function ReceptionistPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSection = searchParams.get("section");

  // Load real-time data from Firestore
  const { loadData, cleanup } = useDataLoader();
  
  useEffect(() => {
    let isMounted = true;
    
    const initializeData = async () => {
      try {
        const success = await loadData();
        if (success && isMounted) {
          console.log('Real-time data loaded successfully');
        }
      } catch (error) {
        console.error('Error loading real-time data:', error);
      }
    };
    
    initializeData();
    
    // Cleanup subscriptions on unmount
    return () => {
      isMounted = false;
      cleanup();
    };
  }, [loadData, cleanup]);

  // Initialize section state - start with URL param or default, then hydrate with localStorage
  const [section, setSection] = useState<string>(urlSection || "Dashboard");
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate state with localStorage after component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSection = localStorage.getItem("receptionist-portal-section");
      if (savedSection && !urlSection) {
        setSection(savedSection);
      }
      setIsHydrated(true);
    }
  }, [urlSection]);

  // Sync section state with localStorage and URL after hydration
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem("receptionist-portal-section", section);
      router.replace(`?section=${section}`, { scroll: false });
    }
  }, [section, router, isHydrated]);

  // Memoize sidebar items to prevent unnecessary re-renders
  const sidebarItems = useMemo(
    () => [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        description: "Front desk operations",
      },
      {
        title: "Patients",
        icon: Users,
        description: "Patient registration & check-in",
      },
      {
        title: "Reports",
        icon: FileText,
        description: "Patient flow & analytics",
      },
      {
        title: "Profile",
        icon: User,
        description: "Personal profile",
      },
    ],
    []
  );

  // Component mapping for conditional rendering
  const componentMap = {
    Dashboard: <ReceptionistDashboard />,
    Patients: <PatientsManagement />,
    Reports: <ReportsComponent />,
    Profile: <ReceptionistProfile />,
  };

  return (
    <SidebarProvider>
      {/* Sidebar with receptionist-specific items */}
      <AppSidebar
        items={sidebarItems.map((item) => ({
          ...item,
          isActive: section === item.title,
        }))}
        section={section}
        onSectionChange={setSection}
      />

      {/* Main content area */}
      <SidebarInset className="flex flex-col">
        {/* Header with responsive breadcrumbs */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b bg-background/95 backdrop-blur transition-all">
          <div className="flex w-full items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    <BreadcrumbLink
                      onClick={() => (window.location.href = "/caresync")}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      Caresync
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem className="flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    <BreadcrumbLink
                      onClick={() => setSection("Dashboard")}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      Receptionist Portal
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium">
                      {section}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </header>

        {/* Main content with smooth transitions */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {componentMap[section as keyof typeof componentMap]}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function ReceptionistPortal() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReceptionistPortalContent />
    </Suspense>
  );
}
