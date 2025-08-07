"use client";

import { 
  ShieldCheck, 
  Stethoscope, 
  UserCog, 
  Users 
} from "lucide-react";
import { useRouter } from "next/navigation";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

const RoleBasedNavigation = () => {
  const router = useRouter();

  const roles = [
    {
      title: "Doctor Portal",
      description: "Access your rooms, profile, and assistant management",
      icon: Stethoscope,
      href: "/caresync/dashboards/doctor",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Assistant Portal",
      description: "Manage your assignments and doctor coordination",
      icon: UserCog,
      href: "/caresync/dashboards/assistant",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Receptionist Portal",
      description: "Handle front desk operations and patient management",
      icon: ShieldCheck,
      href: "/caresync/dashboards/receptionist",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Role-Based Dashboards
        </CardTitle>
        <CardDescription>
          Access specialized dashboards based on your role in the clinic
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((role) => {
            const IconComponent = role.icon;
            
            return (
              <Card
                key={role.title}
                className={`cursor-pointer transition-all hover:shadow-md border-2 hover:border-primary ${role.borderColor}`}
                onClick={() => {
                  router.push(role.href);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${role.bgColor} ${role.borderColor} border`}>
                      <IconComponent className={`h-6 w-6 ${role.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">
                        {role.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleBasedNavigation;
