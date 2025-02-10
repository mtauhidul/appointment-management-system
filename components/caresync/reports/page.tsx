import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import { useState } from "react";
import { DateRange } from "react-day-picker"; // ✅ Import from react-day-picker
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Reports = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2022, 0, 20),
    to: new Date(2022, 0, 30),
  });

  const [reportData, setReportData] = useState({
    staffActivityTime: 0,
    doctorActivityTime: 0,
    patientActivityTime: 0,
  });

  const [chartData, setChartData] = useState([
    { name: "Staff", time: 0 },
    { name: "Doctors", time: 0 },
    { name: "Patients", time: 0 },
  ]);

  const handleFilter = () => {
    if (dateRange?.from && dateRange?.to) {
      // Simulate fetching and calculating activity data
      const newData = {
        staffActivityTime: 120,
        doctorActivityTime: 150,
        patientActivityTime: 200,
      };

      setReportData(newData);
      setChartData([
        { name: "Staff", time: newData.staffActivityTime },
        { name: "Doctors", time: newData.doctorActivityTime },
        { name: "Patients", time: newData.patientActivityTime },
      ]);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <div>
        <h2 className="text-xl font-medium mb-4">Activity Time</h2>
        <div className="flex items-center gap-4 mb-6">
          <DatePickerWithRange
            className="flex-1"
            onDateChange={setDateRange} // ✅ Directly pass the state updater
          />
          <Button onClick={handleFilter}>Filter</Button>
        </div>

        <Card className="p-4">
          <div className="mb-4">
            <p>
              Average Staff Activity Time: {reportData.staffActivityTime}{" "}
              minutes
            </p>
            <p>
              Average Doctor Activity Time: {reportData.doctorActivityTime}{" "}
              minutes
            </p>
            <p>
              Average Patient Activity Time: {reportData.patientActivityTime}{" "}
              minutes
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="time" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
