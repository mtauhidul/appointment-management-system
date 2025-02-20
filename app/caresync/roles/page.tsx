"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import AssistantsList from "./assistantsList/assistantsList";
import DoctorsList from "./doctorsList/doctorsList";
import ReceptionistsList from "./receptionistsList/receptionistsList";

const Roles = () => {
  const [activeTab, setActiveTab] = useState<
    "doctors" | "assistants" | "receptionists"
  >("doctors");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Roles</h1>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "doctors" | "assistants" | "receptionists")
        }
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="assistants">Assistants</TabsTrigger>
          <TabsTrigger value="receptionists">Receptionists</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors">
          <DoctorsList />
        </TabsContent>

        <TabsContent value="assistants">
          <AssistantsList />
        </TabsContent>

        <TabsContent value="receptionists">
          <ReceptionistsList />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
};

export default Roles;
