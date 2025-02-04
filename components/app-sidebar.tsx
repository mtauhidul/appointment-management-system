"use client";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { GalleryVerticalEnd, LucideIcon } from "lucide-react";

// This is sample data.

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface Company {
  name: string;
  logo: React.ComponentType;
  plan: string;
}

interface Data {
  user: User;
  company: Company[];
}

const data: Data = {
  user: {
    name: "John Smith",
    email: "john.smith@mail.com",
    avatar: "/assets/images/avatar.svg",
  },
  company: [
    {
      name: "YTFCS",
      logo: GalleryVerticalEnd,
      plan: "Katy, TX",
    },
  ],
};

type NavItem = {
  title: string;

  icon: LucideIcon;

  isActive?: boolean;
};

export const AppSidebar = ({
  items,
  section,
  onSectionChange,
}: {
  items: NavItem[];
  section: string;
  onSectionChange: (section: string) => void;
}) => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={data.company} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={items}
          section={section}
          onSectionChange={onSectionChange}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
