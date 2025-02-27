import DataProvider from "@/lib/providers/data-provider";
import { ReactNode } from "react";
import PatientPortalSidebar from "./patient-portal-sidebar";

export default function PatientPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DataProvider>
      <div className="flex min-h-screen">
        {/* Sidebar for desktop - always visible on md screens and up */}
        <div className="hidden md:block w-64 flex-shrink-0 border-r">
          <PatientPortalSidebar isMobile={false} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto w-full">
          {/* Only show mobile controls on small screens */}
          <div className="md:hidden">
            <PatientPortalSidebar isMobile={true} />
          </div>
          {/* Padding top if not in mobile */}
          <div
            className="flex flex-1 flex-col gap-4
            p-4 pt-0 md:p-8 md:pt-4
          "
          >
            {children}
          </div>
        </main>
      </div>
    </DataProvider>
  );
}
