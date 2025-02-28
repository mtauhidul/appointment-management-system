import { CalendarIcon, VideoIcon } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Responsive Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Health Metrics Card */}
        <div className="rounded-xl bg-muted/50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Health Metrics</h2>
          <div className="flex flex-col justify-between h-full">
            <div className="grid grid-cols-2 gap-4">
              {["BP", "Heart Rate", "SpO2", "Glucose"].map((metric, index) => (
                <div key={index} className="rounded-lg bg-background p-3">
                  <p className="text-sm text-muted-foreground">{metric}</p>
                  <p className="text-2xl font-bold">
                    {metric === "BP"
                      ? "120/80"
                      : metric === "Heart Rate"
                      ? "72"
                      : metric === "SpO2"
                      ? "98%"
                      : "92"}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-right text-sm text-primary">View Trends →</div>
          </div>
        </div>

        {/* Appointments & Actions Card */}
        <div className="rounded-xl bg-muted/50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Upcoming</h2>
          <div className="space-y-3">
            {[
              {
                title: "Annual Checkup",
                date: "Apr 15 · 10:00 AM",
                icon: <CalendarIcon className="h-4 w-4" />,
              },
              {
                title: "Dermatology",
                date: "Apr 22 · 2:30 PM",
                icon: <VideoIcon className="h-4 w-4" />,
              },
            ].map((appointment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{appointment.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.date}
                  </p>
                </div>
                <button className="rounded-full p-2 bg-primary text-white">
                  {appointment.icon}
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
            <button className="rounded-lg bg-primary p-2 text-sm text-white">
              Schedule New
            </button>
            <button className="rounded-lg border p-2 text-sm">
              Message Care Team
            </button>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="rounded-xl bg-muted/50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <div className="space-y-4 overflow-y-auto">
            {[
              {
                status: "New Lab Result",
                detail: "Lipid Panel · Mar 1",
                color: "bg-primary",
              },
              {
                status: "Prescription Renewed",
                detail: "Metformin · Mar 5",
                color: "bg-green-500",
              },
              {
                status: "Appointment Completed",
                detail: "Dr. Smith · Feb 20",
                color: "bg-blue-500",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className={`mt-1 h-2 w-2 rounded-full ${activity.color}`}
                />
                <div>
                  <p className="font-medium">{activity.status}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Summary Section */}
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Patient Overview */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Patient Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Allergies", detail: "Penicillin, Milk" },
                { title: "Conditions", detail: "Diabetes Type 2" },
                { title: "Medications", detail: "3 Active" },
                { title: "Last Visit", detail: "Feb 15, 2024" },
              ].map((item, index) => (
                <div key={index} className="rounded-lg bg-background p-4">
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <p className="font-medium">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Health Timeline */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Health Timeline</h2>
            <div className="space-y-4">
              {[
                {
                  title: "Weight Check",
                  detail: "65kg · Mar 10",
                  color: "bg-primary",
                },
                {
                  title: "Vaccination",
                  detail: "Flu Shot · Feb 28",
                  color: "bg-green-500",
                },
                {
                  title: "Lab Work",
                  detail: "CBC · Feb 15",
                  color: "bg-blue-500",
                },
              ].map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full ${event.color}`} />
                    <div className="h-full w-px bg-border" />
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
