import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Save, Settings } from "lucide-react";
import React, { useState } from "react";

interface FHIRConfigurationProps {
  trigger?: React.ReactNode;
}

export const FHIRConfiguration: React.FC<FHIRConfigurationProps> = ({
  trigger,
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [config, setConfig] = useState({
    baseUrl: "https://fhir.eclinicalworks.com/r4",
    clientId: "",
    clientSecret: "",
    scope: "patient/*.read practitioner/*.read appointment/*.read",
    timeout: 30000,
  });

  const handleSave = () => {
    // Here you would typically save to localStorage or a configuration service
    localStorage.setItem("fhir-config", JSON.stringify(config));

    toast({
      title: "Configuration Saved",
      description: "FHIR configuration has been saved successfully.",
    });

    setIsOpen(false);
  };

  const handleReset = () => {
    setConfig({
      baseUrl: "https://fhir.eclinicalworks.com/r4",
      clientId: "",
      clientSecret: "",
      scope: "patient/*.read practitioner/*.read appointment/*.read",
      timeout: 30000,
    });
  };

  // Load saved configuration on component mount
  React.useEffect(() => {
    const savedConfig = localStorage.getItem("fhir-config");
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (error) {
        console.error("Error parsing saved FHIR config:", error);
      }
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>FHIR Configuration</DialogTitle>
          <DialogDescription>
            Configure your eClinicalWorks FHIR R4 endpoint connection settings.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 pr-2">
          {/* Connection Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">
                Connection Settings
              </CardTitle>
              <CardDescription className="text-sm">
                Configure the FHIR server endpoint and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseUrl" className="text-sm font-medium">
                  FHIR Base URL
                </Label>
                <Input
                  id="baseUrl"
                  value={config.baseUrl}
                  onChange={(e) =>
                    setConfig({ ...config, baseUrl: e.target.value })
                  }
                  placeholder="https://fhir.eclinicalworks.com/r4"
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId" className="text-sm font-medium">
                    Client ID
                  </Label>
                  <Input
                    id="clientId"
                    value={config.clientId}
                    onChange={(e) =>
                      setConfig({ ...config, clientId: e.target.value })
                    }
                    placeholder="Your client ID"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientSecret" className="text-sm font-medium">
                    Client Secret
                  </Label>
                  <div className="relative">
                    <Input
                      id="clientSecret"
                      type={showPassword ? "text" : "password"}
                      value={config.clientSecret}
                      onChange={(e) =>
                        setConfig({ ...config, clientSecret: e.target.value })
                      }
                      placeholder="Your client secret"
                      className="pr-10 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope" className="text-sm font-medium">
                  OAuth Scope
                </Label>
                <Input
                  id="scope"
                  value={config.scope}
                  onChange={(e) =>
                    setConfig({ ...config, scope: e.target.value })
                  }
                  placeholder="patient/*.read practitioner/*.read"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout" className="text-sm font-medium">
                  Request Timeout (ms)
                </Label>
                <Input
                  id="timeout"
                  type="number"
                  value={config.timeout}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      timeout: parseInt(e.target.value) || 30000,
                    })
                  }
                  placeholder="30000"
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-800 text-xs"
                >
                  Security Notice
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-amber-700">
                Your FHIR credentials are stored locally in your browser for
                this session only. For production use, ensure you have proper
                security measures in place.
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-amber-600 font-medium">
                  Key Security Requirements:
                </p>
                <ul className="text-xs text-amber-700 list-disc pl-4 space-y-0.5">
                  <li>Secure credential storage</li>
                  <li>Token refresh mechanisms</li>
                  <li>Network security (HTTPS)</li>
                  <li>Access logging and monitoring</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleReset}
            size="sm"
            className="text-sm"
          >
            Reset to Default
          </Button>
          <Button onClick={handleSave} size="sm" className="text-sm">
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
