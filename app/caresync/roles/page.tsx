"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { useAssistantStore } from "@/lib/store/useAssistantStore";
import { useDoctorStore } from "@/lib/store/useDoctorStore";
import { useReceptionistStore } from "@/lib/store/useReceptionistStore";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import AssistantsList from "./assistantsList/assistantsList";
import DoctorsList from "./doctorsList/doctorsList";
import ReceptionistsList from "./receptionistsList/receptionistsList";

const Roles = () => {
  const [activeTab, setActiveTab] = useState<
    "doctors" | "assistants" | "receptionists"
  >("doctors");

  // Screen size tracking
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  // Get counts from stores for summary cards
  const { doctors } = useDoctorStore();
  const { assistants } = useAssistantStore();
  const { receptionists } = useReceptionistStore();

  // Track screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tabs navigation helpers
  const tabs = [
    {
      id: "doctors",
      label: "Doctors",
      icon: <UserRound className="h-4 w-4" />,
    },
    {
      id: "assistants",
      label: "Assistants",
      icon: <Stethoscope className="h-4 w-4" />,
    },
    {
      id: "receptionists",
      label: "Receptionists",
      icon: <Users className="h-4 w-4" />,
    },
  ];

  const currentTabIndex = tabs.findIndex((tab) => tab.id === activeTab);

  const goToNextTab = () => {
    const nextIndex = (currentTabIndex + 1) % tabs.length;
    setActiveTab(
      tabs[nextIndex].id as "doctors" | "assistants" | "receptionists"
    );
  };

  const goToPrevTab = () => {
    const prevIndex = (currentTabIndex - 1 + tabs.length) % tabs.length;
    setActiveTab(
      tabs[prevIndex].id as "doctors" | "assistants" | "receptionists"
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center">
            <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary" />
            <span>Staff Management</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">
            Manage doctors, assistants, and receptionists
          </p>
        </div>

        {/* Tab navigation for mobile and small screens */}
        <div className="flex items-center gap-1 sm:hidden">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToPrevTab}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {tabs[currentTabIndex].label}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToNextTab}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Summary Cards (desktop only) */}
        <div className="hidden lg:flex gap-2">
          <SummaryCard
            title="Doctors"
            count={doctors.length}
            icon={<UserRound className="h-4 w-4 text-blue-600" />}
            isActive={activeTab === "doctors"}
            onClick={() => setActiveTab("doctors")}
          />
          <SummaryCard
            title="Assistants"
            count={assistants.length}
            icon={<Stethoscope className="h-4 w-4 text-green-600" />}
            isActive={activeTab === "assistants"}
            onClick={() => setActiveTab("assistants")}
          />
          <SummaryCard
            title="Receptionists"
            count={receptionists.length}
            icon={<Users className="h-4 w-4 text-purple-600" />}
            isActive={activeTab === "receptionists"}
            onClick={() => setActiveTab("receptionists")}
          />
        </div>
      </div>

      <Separator className="my-2 sm:my-3" />

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "doctors" | "assistants" | "receptionists")
        }
        className="space-y-4"
      >
        {/* Tabs are hidden on mobile but shown on tablets and up */}
        <TabsList className="hidden sm:flex w-full sm:w-auto mb-2">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5"
            >
              {tab.icon}
              <span>{tab.label}</span>
              {screenSize.isTablet || screenSize.isDesktop ? (
                <span className="ml-1 bg-gray-100 text-gray-700 text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
                  {tab.id === "doctors"
                    ? doctors.length
                    : tab.id === "assistants"
                    ? assistants.length
                    : receptionists.length}
                </span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent
          value="doctors"
          className="mt-0 sm:mt-2 focus-visible:outline-none"
        >
          <DoctorsList />
        </TabsContent>

        <TabsContent
          value="assistants"
          className="mt-0 sm:mt-2 focus-visible:outline-none"
        >
          <AssistantsList />
        </TabsContent>

        <TabsContent
          value="receptionists"
          className="mt-0 sm:mt-2 focus-visible:outline-none"
        >
          <ReceptionistsList />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
};

// Summary card for desktop view
const SummaryCard = ({
  title,
  count,
  icon,
  isActive,
  onClick,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all hover:border-primary ${
        isActive ? "border-primary bg-primary/5" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3 flex items-center gap-2">
        <div className="rounded-md bg-gray-100 p-1.5">{icon}</div>
        <div>
          <p className="text-xs font-medium text-gray-500">{title}</p>
          <p className="text-sm font-semibold">{count}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Roles;
