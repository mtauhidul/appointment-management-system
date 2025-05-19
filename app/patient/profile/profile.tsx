import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Edit, Mail, Phone, Shield, User } from "lucide-react";

const Profile = () => {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      {/* Header Section with Background Gradient */}
      <div className="relative rounded-xl overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>

        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar with Border */}
          <div className="h-24 w-24 rounded-full border-4 border-white bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
            <span className="text-2xl font-bold text-blue-600">RC</span>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
              <h1 className="text-2xl font-bold">Roger Curtis</h1>
              <Badge className="mx-auto sm:mx-0 bg-blue-500/80 hover:bg-blue-600 text-xs py-1">
                Active Patient
              </Badge>
            </div>

            <p className="text-muted-foreground">Patient ID: 208898786</p>

            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Information Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-50 p-1.5 rounded-md">
              <User className="h-5 w-5 text-blue-500" />
            </div>
            <h2 className="font-semibold">Personal Information</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">
                  Date of Birth
                </p>
                <p className="font-medium">15th March 1988</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <p className="font-medium">roger.curtis@example.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-purple-50 p-1.5 rounded-md">
              <Phone className="h-5 w-5 text-purple-500" />
            </div>
            <h2 className="font-semibold">Contact Information</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                <p className="font-medium">(555) 123-4567</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">
                  Emergency Contact
                </p>
                <p className="font-medium">Jane Curtis • (555) 765-4321</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
