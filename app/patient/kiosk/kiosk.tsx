import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, MonitorSmartphone, QrCode, X } from "lucide-react";
import { useState } from "react";

export default function Kiosk() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setLoading(true);
    setIsOpen(true);
    // Reset loading after a delay to simulate loading state
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 md:p-10 bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Kiosk Welcome Card */}
      <Card className="max-w-md w-full bg-white/95 backdrop-blur-sm shadow-md border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MonitorSmartphone className="h-5 w-5 text-primary" />
            Self-Service Kiosk
          </CardTitle>
          <CardDescription>
            Access our self-service kiosk for quick check-in and paperwork
          </CardDescription>
        </CardHeader>

        <Separator className="mx-6" />

        <CardContent className="pt-6 pb-4 flex flex-col items-center">
          <div className="mb-6 text-center max-w-xs">
            <p className="text-sm text-muted-foreground mb-2">
              Use our digital kiosk to complete pre-appointment paperwork,
              check-in for appointments, and update your information.
            </p>

            <div className="mt-4 bg-primary/10 p-3 rounded-lg flex items-center gap-3">
              <QrCode className="h-8 w-8 text-primary flex-shrink-0" />
              <p className="text-xs text-left">
                You can also scan the QR code at our office with your mobile
                device to access the kiosk.
              </p>
            </div>
          </div>

          <Button
            onClick={handleOpen}
            className="gap-2 min-w-[180px]"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Loading...
              </>
            ) : (
              <>
                Start Kiosk
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Kiosk Full-Screen Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b p-4 bg-primary/5">
            <div className="flex items-center gap-2">
              <MonitorSmartphone className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">
                YTFCS Self-Service Kiosk
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Press ESC to exit
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="rounded-full h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-muted-foreground text-sm">
                    Loading kiosk application...
                  </p>
                </div>
              </div>
            ) : (
              <iframe
                src="http://localhost:3001/"
                className="w-full h-full"
                title="Integrated Kiosk Application"
                style={{
                  border: "none",
                  overflow: "auto",
                }}
              />
            )}
          </div>

          {/* Modal Footer */}
          <div className="border-t p-2 flex justify-end bg-primary/5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Close Kiosk
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
