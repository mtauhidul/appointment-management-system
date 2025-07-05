"use client";

import { ChevronDown, FileText, Info, Upload } from "lucide-react";
import Papa from "papaparse";
import { useState } from "react";
import * as XLSX from "xlsx";

import { FHIRIntegrationPanel } from "@/components/fhir/fhir-integration-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PatientsSection = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedFileData, setSelectedFileData] = useState<FileData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  interface FileData {
    id: number;
    name: string;
    date: string;
    content: { [key: string]: string }[];
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      !file.name.endsWith(".csv") &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      alert("Invalid file format. Please upload a CSV or Excel file.");
      return;
    }

    setIsLoading(true);

    const newFile: FileData = {
      id: Date.now(),
      name: file.name,
      date: new Date().toLocaleDateString(),
      content: [],
    };

    try {
      if (file.name.endsWith(".csv")) {
        const parsedData = await parseCSV(file);
        newFile.content = parsedData;
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const parsedData = await parseExcel(file);
        newFile.content = parsedData;
      }

      setFiles((prevFiles) => [...prevFiles, newFile]);
      setSelectedFileData(newFile);
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("Error parsing file. Please ensure it is properly formatted.");
    } finally {
      setIsLoading(false);
      // Reset input value to allow uploading the same file again
      event.target.value = "";
    }
  };

  const parseCSV = (file: File): Promise<{ [key: string]: string }[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as { [key: string]: string }[]);
        },
        error: (error) => reject(error),
      });
    });
  };

  const parseExcel = async (
    file: File
  ): Promise<{ [key: string]: string }[]> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as string[][];
          const headers = jsonData[0];
          const rows = jsonData.slice(1);
          const formattedData = rows.map((row) =>
            row.reduce(
              (acc, value, index) => ({
                ...acc,
                [headers[index]]: value,
              }),
              {}
            )
          );
          resolve(formattedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileClick = (file: FileData) => {
    setSelectedFileData(file);
  };

  const getFileTypeColor = (fileName: string) => {
    if (fileName.endsWith(".csv")) return "bg-green-100 text-green-800";
    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls"))
      return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split(".").pop()?.toUpperCase() || "";
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-3 sm:px-4 border-2 border-dashed rounded-lg text-gray-500 bg-gray-50">
      <FileText className="h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 text-gray-400" />
      <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2 text-center">
        No files uploaded yet
      </h3>
      <p className="text-xs sm:text-sm text-center mb-3 sm:mb-4 px-2">
        Upload your first patient data file to get started
      </p>
      <label htmlFor="file-upload" className="cursor-pointer">
        <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm">
          <Upload className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Browse
          Files
        </span>
        <Input
          id="file-upload"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Patient Records</h1>
        <div className="text-sm text-gray-600">
          Manage patient data through file uploads or FHIR integration
        </div>
      </div>

      {/* FHIR Integration Panel */}
      <FHIRIntegrationPanel
        onPatientSync={(patientId) => {
          console.log("Patient synced:", patientId);
          // You can add additional logic here if needed
        }}
        onPractitionerSync={(practitionerId) => {
          console.log("Practitioner synced:", practitionerId);
          // You can add additional logic here if needed
        }}
      />

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg font-semibold">File Upload</h2>
              <p className="text-sm text-gray-600">
                Upload patient data files (CSV, Excel)
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <label
                htmlFor="upload-patients-file"
                className="flex items-center justify-center w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors"
              >
                <Upload className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                <span className="text-sm font-medium">Upload File</span>
                <Input
                  id="upload-patients-file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Sort by name</DropdownMenuItem>
                <DropdownMenuItem>Sort by date</DropdownMenuItem>
                <DropdownMenuItem>Clear all files</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center p-6 sm:p-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {files.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* File Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                <TooltipProvider>
                  {files.map((file) => (
                    <Tooltip key={file.id}>
                      <TooltipTrigger asChild>
                        <Card
                          className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedFileData?.id === file.id
                              ? "ring-2 ring-primary"
                              : ""
                          }`}
                          onClick={() => handleFileClick(file)}
                        >
                          <div className="p-3 sm:p-4 flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  className={`${getFileTypeColor(
                                    file.name
                                  )} text-xs px-1.5 py-0.5`}
                                  variant="outline"
                                >
                                  {getFileExtension(file.name)}
                                </Badge>
                              </div>
                              <h3
                                className="font-medium text-sm truncate"
                                title={file.name}
                              >
                                {file.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                                {file.date} • {file.content.length} records
                              </p>
                            </div>
                          </div>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="text-xs">
                          <p>
                            <strong>File:</strong> {file.name}
                          </p>
                          <p>
                            <strong>Rows:</strong> {file.content.length}
                          </p>
                          <p>
                            <strong>Columns:</strong>{" "}
                            {Object.keys(file.content[0] || {}).length}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>

              {/* Selected File Data Table */}
              {selectedFileData?.content &&
                selectedFileData.content.length > 0 && (
                  <Card className="mt-4 sm:mt-6">
                    <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="text-base sm:text-lg font-medium flex items-center gap-1.5 sm:gap-2 truncate">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">
                              {selectedFileData.name}
                            </span>
                          </h2>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {selectedFileData.content.length} rows •{" "}
                            {
                              Object.keys(selectedFileData.content[0] || {})
                                .length
                            }{" "}
                            columns
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 sm:mt-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => {
                                  // Export functionality
                                  if (!selectedFileData) return;

                                  // Determine file type based on original file name
                                  const isCSV =
                                    selectedFileData.name.endsWith(".csv");

                                  // Create export data
                                  let exportData;

                                  if (isCSV) {
                                    // For CSV export
                                    const headers = Object.keys(
                                      selectedFileData.content[0] || {}
                                    );
                                    const csvContent = [
                                      headers.join(","),
                                      ...selectedFileData.content.map((row) =>
                                        headers
                                          .map((header) => {
                                            // Handle commas in content by quoting
                                            const value = String(
                                              row[header] || ""
                                            );
                                            return value.includes(",")
                                              ? `"${value}"`
                                              : value;
                                          })
                                          .join(",")
                                      ),
                                    ].join("\n");

                                    exportData = new Blob([csvContent], {
                                      type: "text/csv;charset=utf-8;",
                                    });
                                  } else {
                                    // For JSON export (fallback)
                                    exportData = new Blob(
                                      [
                                        JSON.stringify(
                                          selectedFileData.content,
                                          null,
                                          2
                                        ),
                                      ],
                                      { type: "application/json" }
                                    );
                                  }

                                  // Create download link
                                  const url = URL.createObjectURL(exportData);
                                  const link = document.createElement("a");
                                  link.href = url;

                                  // Set filename
                                  const extensionIndex =
                                    selectedFileData.name.lastIndexOf(".");
                                  const baseName =
                                    extensionIndex !== -1
                                      ? selectedFileData.name.substring(
                                          0,
                                          extensionIndex
                                        )
                                      : selectedFileData.name;

                                  link.download = isCSV
                                    ? `${baseName}_export.csv`
                                    : `${baseName}_export.json`;

                                  // Trigger download and cleanup
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  URL.revokeObjectURL(url);
                                }}
                              >
                                Export
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                Export data in original format
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  // Show file statistics and information in a modal or alert
                                  if (!selectedFileData) return;

                                  const fileInfo = {
                                    fileName: selectedFileData.name,
                                    fileType: selectedFileData.name.endsWith(
                                      ".csv"
                                    )
                                      ? "CSV"
                                      : selectedFileData.name.endsWith(".xlsx")
                                      ? "Excel (XLSX)"
                                      : selectedFileData.name.endsWith(".xls")
                                      ? "Excel (XLS)"
                                      : "Unknown",
                                    uploadDate: selectedFileData.date,
                                    recordCount:
                                      selectedFileData.content.length,
                                    columnCount: Object.keys(
                                      selectedFileData.content[0] || {}
                                    ).length,
                                    columns: Object.keys(
                                      selectedFileData.content[0] || {}
                                    ),
                                  };

                                  // Use alert for simplicity, but this could be replaced with a modal
                                  alert(
                                    `File Information:\n` +
                                      `Name: ${fileInfo.fileName}\n` +
                                      `Type: ${fileInfo.fileType}\n` +
                                      `Uploaded: ${fileInfo.uploadDate}\n` +
                                      `Records: ${fileInfo.recordCount}\n` +
                                      `Columns: ${fileInfo.columnCount}\n\n` +
                                      `Column Names:\n${fileInfo.columns.join(
                                        ", "
                                      )}`
                                  );
                                }}
                              >
                                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                View detailed information about this file
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Modified to indicate data is fully displayed without truncation */}
                      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1 sm:hidden">
                        <span>←</span> Swipe to see all columns <span>→</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="rounded-b-md border">
                        {/* Completely redesigned table container with proper horizontal scrolling */}
                        <div className="w-full overflow-x-auto pb-2 overscroll-x-contain">
                          <Table className="w-full min-w-[640px]">
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                {Object.keys(
                                  selectedFileData.content[0] || {}
                                ).map((key, index) => (
                                  <TableHead
                                    key={key}
                                    className="p-2 sm:p-3 text-xs font-medium text-muted-foreground bg-muted/50"
                                    style={{
                                      position: "sticky",
                                      top: 0,
                                      backgroundColor: "var(--muted)",
                                      zIndex: 10,
                                      borderRight:
                                        index <
                                        Object.keys(
                                          selectedFileData.content[0] || {}
                                        ).length -
                                          1
                                          ? "1px solid var(--border)"
                                          : "none",
                                      minWidth: "180px", // Ensure minimum width for each column
                                      padding: "8px 12px",
                                    }}
                                  >
                                    {/* No truncation for headers */}
                                    <div className="font-medium">{key}</div>
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedFileData.content
                                .slice(0, 100)
                                .map((row, index) => (
                                  <TableRow
                                    key={index}
                                    className="hover:bg-muted/50 transition-colors"
                                  >
                                    {Object.entries(row).map(
                                      ([, value], cellIndex) => (
                                        <TableCell
                                          key={cellIndex}
                                          className="p-2 sm:p-3 text-xs sm:text-sm"
                                          style={{
                                            borderRight:
                                              cellIndex <
                                              Object.entries(row).length - 1
                                                ? "1px solid var(--border)"
                                                : "none",
                                            minWidth: "180px", // Ensure minimum width for each column
                                            padding: "8px 12px",
                                            wordBreak: "normal",
                                            whiteSpace: "normal",
                                          }}
                                        >
                                          {/* No truncation for cell content */}
                                          <div>{String(value)}</div>
                                        </TableCell>
                                      )
                                    )}
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination indicator if more than 100 rows */}
                        {selectedFileData.content.length > 100 && (
                          <div className="py-2 px-3 text-xs text-center text-muted-foreground border-t">
                            Showing 100 of {selectedFileData.content.length}{" "}
                            records
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PatientsSection;
