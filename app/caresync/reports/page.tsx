"use client";

import { addDays, format } from "date-fns";
import { Activity, CalendarIcon, UserCog, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Healthcare-focused color palette
const colorPalette = {
  staff: "#4f46e5", // Deep indigo for staff
  doctors: "#059669", // Emerald green for doctors
  patients: "#0ea5e9", // Sky blue for patients
  success: "#10b981", // Green for positive metrics
  warning: "#f59e0b", // Amber for moderate metrics
  danger: "#ef4444", // Red for negative metrics
  neutral: "#6b7280", // Gray for neutral data
};

const MedicalAnalytics = () => {
  // States for date range
  const [fromDate, setFromDate] = useState<Date>(addDays(new Date(), -30));
  const [toDate, setToDate] = useState<Date>(new Date());
  const sheetCloseRef = useRef<HTMLButtonElement>(null);

  const [chartData, setChartData] = useState<
    { name: string; time: number; color: string; trend: number[] }[]
  >([
    { name: "Staff", time: 0, color: colorPalette.staff, trend: [] },
    { name: "Doctors", time: 0, color: colorPalette.doctors, trend: [] },
    { name: "Patients", time: 0, color: colorPalette.patients, trend: [] },
  ]);

  const [trendData, setTrendData] = useState<
    { date: string; staff: number; doctors: number; patients: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState("time");
  const [timePeriod, setTimePeriod] = useState("daily");
  const [insightMetrics, setInsightMetrics] = useState({
    patientWaitTime: 0,
    staffEfficiency: 0,
    doctorAvailability: 0,
    patientSatisfaction: 0,
  });

  // Handle date changes
  const handleFromDateChange = (date: Date | undefined) => {
    if (date) {
      setFromDate(date);
    }
  };

  const handleToDateChange = (date: Date | undefined) => {
    if (date) {
      setToDate(date);
    }
  };

  // Generate report based on selected dates
  const handleFilter = () => {
    if (!fromDate || !toDate) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Generate random data for demonstration
      const staffTime = Math.floor(Math.random() * 100) + 120;
      const doctorTime = Math.floor(Math.random() * 100) + 180;
      const patientTime = Math.floor(Math.random() * 100) + 60;

      // Generate trend data
      const trend = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(
          fromDate,
          i *
            Math.floor(
              (toDate.getTime() - fromDate.getTime()) /
                (7 * 24 * 60 * 60 * 1000)
            )
        );
        return {
          date: format(date, "MMM d"),
          staff: Math.floor(Math.random() * 40) + 100,
          doctors: Math.floor(Math.random() * 40) + 160,
          patients: Math.floor(Math.random() * 40) + 40,
        };
      });

      setTrendData(trend);

      setChartData([
        {
          name: "Staff",
          time: staffTime,
          color: colorPalette.staff,
          trend: trend.map((t) => t.staff),
        },
        {
          name: "Doctors",
          time: doctorTime,
          color: colorPalette.doctors,
          trend: trend.map((t) => t.doctors),
        },
        {
          name: "Patients",
          time: patientTime,
          color: colorPalette.patients,
          trend: trend.map((t) => t.patients),
        },
      ]);

      // Set insight metrics
      setInsightMetrics({
        patientWaitTime: Math.floor(Math.random() * 30) + 10,
        staffEfficiency: Math.floor(Math.random() * 30) + 60,
        doctorAvailability: Math.floor(Math.random() * 20) + 70,
        patientSatisfaction: Math.floor(Math.random() * 15) + 80,
      });

      setIsLoading(false);

      // Close sheet on mobile after applying filters
      if (sheetCloseRef.current) {
        sheetCloseRef.current.click();
      }
    }, 800);
  };

  // Initialize data
  useEffect(() => {
    handleFilter();
  }, []);

  // Chart tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number; name?: string }[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border rounded-md shadow-sm p-3 text-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{
                color:
                  colorPalette[entry.name as keyof typeof colorPalette] ||
                  "gray",
              }}
            >
              {entry.name}: {entry.value} {reportType === "time" ? "min" : "%"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Icon for stat cards
  const getStatIcon = (type: string) => {
    switch (type) {
      case "Staff":
        return (
          <Users className="h-5 w-5" style={{ color: colorPalette.staff }} />
        );
      case "Doctors":
        return (
          <UserCog
            className="h-5 w-5"
            style={{ color: colorPalette.doctors }}
          />
        );
      case "Patients":
        return (
          <Activity
            className="h-5 w-5"
            style={{ color: colorPalette.patients }}
          />
        );
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  // Date picker components
  const FromDatePicker = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !fromDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          {fromDate ? format(fromDate, "MMM d, yyyy") : <span>Start date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={fromDate}
          onSelect={handleFromDateChange}
          initialFocus
          disabled={(date) => date > toDate}
        />
      </PopoverContent>
    </Popover>
  );

  const ToDatePicker = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !toDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          {toDate ? format(toDate, "MMM d, yyyy") : <span>End date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={toDate}
          onSelect={handleToDateChange}
          initialFocus
          disabled={(date) => date < fromDate}
        />
      </PopoverContent>
    </Popover>
  );

  // Filters component for mobile sheet
  const FiltersContent = ({ isMobile = false }) => (
    <div className="space-y-5">
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Date Range</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">From</label>
            <FromDatePicker />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">To</label>
            <ToDatePicker />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Data Settings</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Time Analysis</SelectItem>
                <SelectItem value="efficiency">Staff Efficiency</SelectItem>
                <SelectItem value="satisfaction">Patient Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Time Frame</label>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button
        onClick={handleFilter}
        className="w-full h-10"
        disabled={isLoading}
      >
        {isLoading ? "Generating..." : "Apply Filters"}
      </Button>

      {isMobile && (
        <SheetClose ref={sheetCloseRef} className="hidden">
          Close
        </SheetClose>
      )}
    </div>
  );

  // Get status for metrics
  const getMetricStatus = (value: number, type: string) => {
    if (type === "patientWaitTime") {
      return value < 15 ? "success" : value < 25 ? "warning" : "danger";
    }
    return value > 80 ? "success" : value > 65 ? "warning" : "danger";
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Modern header with brand line */}
      <div className="border-b pb-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Healthcare Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor time allocation and effectiveness across user groups
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white text-primary border border-primary/20 hover:bg-primary/5">
              {format(fromDate, "MMM d")} - {format(toDate, "MMM d, yyyy")}
            </Badge>

            {/* Mobile filters button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="sm:hidden">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[90vh] sm:h-[60vh] rounded-t-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium">Report Settings</h3>
                  <SheetClose className="rounded-full p-1 hover:bg-muted">
                    <X className="h-4 w-4" />
                  </SheetClose>
                </div>
                <div className="max-h-[calc(90vh-100px)] overflow-y-auto pb-6">
                  <FiltersContent isMobile={true} />
                </div>
              </SheetContent>
            </Sheet>

            <Button onClick={handleFilter} className="hidden sm:flex">
              Update
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar for desktop */}
        <div className="hidden sm:block col-span-12 lg:col-span-3 space-y-6">
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Filters</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <FiltersContent />
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Average Wait Time
                    </span>
                    <span
                      className={`font-medium ${
                        getMetricStatus(
                          insightMetrics.patientWaitTime,
                          "patientWaitTime"
                        ) === "success"
                          ? "text-green-600"
                          : getMetricStatus(
                              insightMetrics.patientWaitTime,
                              "patientWaitTime"
                            ) === "warning"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {insightMetrics.patientWaitTime} min
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        getMetricStatus(
                          insightMetrics.patientWaitTime,
                          "patientWaitTime"
                        ) === "success"
                          ? "bg-green-500"
                          : getMetricStatus(
                              insightMetrics.patientWaitTime,
                              "patientWaitTime"
                            ) === "warning"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          insightMetrics.patientWaitTime * 2,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Staff Efficiency
                    </span>
                    <span
                      className={`font-medium ${
                        getMetricStatus(
                          insightMetrics.staffEfficiency,
                          "normal"
                        ) === "success"
                          ? "text-green-600"
                          : getMetricStatus(
                              insightMetrics.staffEfficiency,
                              "normal"
                            ) === "warning"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {insightMetrics.staffEfficiency}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        getMetricStatus(
                          insightMetrics.staffEfficiency,
                          "normal"
                        ) === "success"
                          ? "bg-green-500"
                          : getMetricStatus(
                              insightMetrics.staffEfficiency,
                              "normal"
                            ) === "warning"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${insightMetrics.staffEfficiency}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Doctor Availability
                    </span>
                    <span
                      className={`font-medium ${
                        getMetricStatus(
                          insightMetrics.doctorAvailability,
                          "normal"
                        ) === "success"
                          ? "text-green-600"
                          : getMetricStatus(
                              insightMetrics.doctorAvailability,
                              "normal"
                            ) === "warning"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {insightMetrics.doctorAvailability}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        getMetricStatus(
                          insightMetrics.doctorAvailability,
                          "normal"
                        ) === "success"
                          ? "bg-green-500"
                          : getMetricStatus(
                              insightMetrics.doctorAvailability,
                              "normal"
                            ) === "warning"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${insightMetrics.doctorAvailability}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Patient Satisfaction
                    </span>
                    <span
                      className={`font-medium ${
                        getMetricStatus(
                          insightMetrics.patientSatisfaction,
                          "normal"
                        ) === "success"
                          ? "text-green-600"
                          : getMetricStatus(
                              insightMetrics.patientSatisfaction,
                              "normal"
                            ) === "warning"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {insightMetrics.patientSatisfaction}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        getMetricStatus(
                          insightMetrics.patientSatisfaction,
                          "normal"
                        ) === "success"
                          ? "bg-green-500"
                          : getMetricStatus(
                              insightMetrics.patientSatisfaction,
                              "normal"
                            ) === "warning"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${insightMetrics.patientSatisfaction}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 bg-transparent">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key metrics for mobile */}
              <div className="sm:hidden">
                <Card className="overflow-hidden shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Key Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Avg. Wait Time
                      </span>
                      <p
                        className={`text-lg font-medium ${
                          getMetricStatus(
                            insightMetrics.patientWaitTime,
                            "patientWaitTime"
                          ) === "success"
                            ? "text-green-600"
                            : getMetricStatus(
                                insightMetrics.patientWaitTime,
                                "patientWaitTime"
                              ) === "warning"
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {insightMetrics.patientWaitTime} min
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Staff Efficiency
                      </span>
                      <p
                        className={`text-lg font-medium ${
                          getMetricStatus(
                            insightMetrics.staffEfficiency,
                            "normal"
                          ) === "success"
                            ? "text-green-600"
                            : getMetricStatus(
                                insightMetrics.staffEfficiency,
                                "normal"
                              ) === "warning"
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {insightMetrics.staffEfficiency}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Doctor Availability
                      </span>
                      <p
                        className={`text-lg font-medium ${
                          getMetricStatus(
                            insightMetrics.doctorAvailability,
                            "normal"
                          ) === "success"
                            ? "text-green-600"
                            : getMetricStatus(
                                insightMetrics.doctorAvailability,
                                "normal"
                              ) === "warning"
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {insightMetrics.doctorAvailability}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Patient Satisfaction
                      </span>
                      <p
                        className={`text-lg font-medium ${
                          getMetricStatus(
                            insightMetrics.patientSatisfaction,
                            "normal"
                          ) === "success"
                            ? "text-green-600"
                            : getMetricStatus(
                                insightMetrics.patientSatisfaction,
                                "normal"
                              ) === "warning"
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {insightMetrics.patientSatisfaction}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stat cards in a responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {chartData.map((item) => (
                  <Card key={item.name} className="overflow-hidden">
                    <CardHeader
                      className="p-4 pb-2 border-l-4"
                      style={{ borderColor: item.color }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            {item.name} Time
                          </CardTitle>
                          <div className="text-2xl font-bold mt-1">
                            {isLoading ? (
                              <Skeleton className="h-8 w-16" />
                            ) : (
                              `${item.time} min`
                            )}
                          </div>
                        </div>
                        <div className="p-2 rounded-full bg-gray-50">
                          {getStatIcon(item.name)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-xs text-muted-foreground mt-2">
                        {item.name === "Patients"
                          ? "Average time patients spend in facility"
                          : item.name === "Doctors"
                          ? "Average time doctors spend with patients"
                          : "Average time staff assist per patient"}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Chart */}
              <Card className="overflow-hidden shadow-sm">
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-base font-medium">
                    Time Allocation by Role
                  </CardTitle>
                  <CardDescription>
                    Comparing minutes spent across different healthcare roles
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : chartData.length > 0 ? ( // Ensure data exists
                    <div className="w-full min-h-[300px]">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={chartData}
                          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e5e7eb"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12, fontWeight: 500 }}
                            tickFormatter={
                              (value) =>
                                window.innerWidth < 768
                                  ? value.charAt(0)
                                  : value // Show only first letter on mobile
                            }
                            tickMargin={8}
                            angle={0} // Keep text straight
                            textAnchor="middle"
                          />
                          <YAxis
                            tick={{ fontSize: 10 }}
                            tickMargin={5}
                            domain={[0, "auto"]}
                            width={35}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey="time"
                            radius={[6, 6, 0, 0]}
                            barSize={100}
                          >
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                fillOpacity={0.9}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">
                      No data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {/* Trend analysis */}
              <Card className="overflow-hidden shadow-sm">
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-base font-medium">
                    Time Trends
                  </CardTitle>
                  <CardDescription>
                    Time allocation trends across the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ResponsiveContainer
                      width="100%"
                      height={300}
                      className="mt-4"
                    >
                      <LineChart
                        data={trendData}
                        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 14 }}
                          tickMargin={10}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="staff"
                          stroke={colorPalette.staff}
                          name="Staff"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="doctors"
                          stroke={colorPalette.doctors}
                          name="Doctors"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="patients"
                          stroke={colorPalette.patients}
                          name="Patients"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MedicalAnalytics;
