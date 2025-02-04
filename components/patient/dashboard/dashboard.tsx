import { CalendarIcon, VideoIcon } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {/* Health Metrics Card */}
        <div className="aspect-video rounded-xl bg-muted/50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Health Metrics</h2>
          <div className="flex h-[calc(100%-3rem)] flex-col justify-between">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-background p-3">
                <p className="text-sm text-muted-foreground">BP</p>
                <p className="text-2xl font-bold">120/80</p>
              </div>
              <div className="rounded-lg bg-background p-3">
                <p className="text-sm text-muted-foreground">Heart Rate</p>
                <p className="text-2xl font-bold">72</p>
              </div>
              <div className="rounded-lg bg-background p-3">
                <p className="text-sm text-muted-foreground">SpO2</p>
                <p className="text-2xl font-bold">98%</p>
              </div>
              <div className="rounded-lg bg-background p-3">
                <p className="text-sm text-muted-foreground">Glucose</p>
                <p className="text-2xl font-bold">92</p>
              </div>
            </div>
            <div className="text-right text-sm text-primary">View Trends →</div>
          </div>
        </div>

        {/* Appointments & Actions Card */}
        <div className="aspect-video rounded-xl bg-muted/50 p-6">
          <div className="flex h-full flex-col justify-between">
            <div>
              <h2 className="mb-4 text-xl font-semibold">Upcoming</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Annual Checkup</p>
                    <p className="text-sm text-muted-foreground">
                      Apr 15 · 10:00 AM
                    </p>
                  </div>
                  <button className="rounded-full bg-primary p-2 text-white">
                    <CalendarIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dermatology</p>
                    <p className="text-sm text-muted-foreground">
                      Apr 22 · 2:30 PM
                    </p>
                  </div>
                  <button className="rounded-full border p-2">
                    <VideoIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-lg bg-primary p-2 text-sm text-white">
                Schedule New
              </button>
              <button className="rounded-lg border p-2 text-sm">
                Message Care Team
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="aspect-video rounded-xl bg-muted/50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <div className="h-[calc(100%-3rem)] overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">New Lab Result</p>
                  <p className="text-sm text-muted-foreground">
                    Lipid Panel · Mar 1
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium">Prescription Renewed</p>
                  <p className="text-sm text-muted-foreground">
                    Metformin · Mar 5
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium">Appointment Completed</p>
                  <p className="text-sm text-muted-foreground">
                    Dr. Smith · Feb 20
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Summary Section */}
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-6 md:min-h-min">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Patient Overview */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Patient Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-background p-4">
                <p className="text-sm text-muted-foreground">Allergies</p>
                <p className="font-medium">Penicillin, Milk</p>
              </div>
              <div className="rounded-lg bg-background p-4">
                <p className="text-sm text-muted-foreground">Conditions</p>
                <p className="font-medium">Diabetes Type 2</p>
              </div>
              <div className="rounded-lg bg-background p-4">
                <p className="text-sm text-muted-foreground">Medications</p>
                <p className="font-medium">3 Active</p>
              </div>
              <div className="rounded-lg bg-background p-4">
                <p className="text-sm text-muted-foreground">Last Visit</p>
                <p className="font-medium">Feb 15, 2024</p>
              </div>
            </div>
          </div>

          {/* Health Timeline */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Health Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <div className="h-full w-px bg-border" />
                </div>
                <div>
                  <p className="font-medium">Weight Check</p>
                  <p className="text-sm text-muted-foreground">65kg · Mar 10</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <div className="h-full w-px bg-border" />
                </div>
                <div>
                  <p className="font-medium">Vaccination</p>
                  <p className="text-sm text-muted-foreground">
                    Flu Shot · Feb 28
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <div className="h-full w-px bg-border" />
                </div>
                <div>
                  <p className="font-medium">Lab Work</p>
                  <p className="text-sm text-muted-foreground">CBC · Feb 15</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
