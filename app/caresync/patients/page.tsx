"use client";

import { ChevronDown, FileText, Info, Upload } from "lucide-react";
import Papa from "papaparse";
import { useState } from "react";
import * as XLSX from "xlsx";

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
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg text-gray-500 bg-gray-50">
      <FileText className="h-12 w-12 mb-4 text-gray-400" />
      <h3 className="text-lg font-medium mb-2">No files uploaded yet</h3>
      <p className="text-sm text-center mb-4">
        Upload your first patient data file to get started
      </p>
      <label htmlFor="file-upload" className="cursor-pointer">
        <span className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
          <Upload className="mr-2 h-4 w-4" /> Browse Files
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
    <div className="p-4 sm:p-6 space-y-6 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Patient Records</h1>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <label
              htmlFor="upload-patients-file"
              className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors"
            >
              <Upload className="mr-2 h-4 w-4 text-gray-500" />
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
              <Button variant="outline" size="icon">
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
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {files.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {/* File Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                          <div className="p-4 flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  className={getFileTypeColor(file.name)}
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
                              <p className="text-xs text-muted-foreground mt-1">
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
                  <Card className="mt-6">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h2 className="text-lg font-medium flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            {selectedFileData.name}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {selectedFileData.content.length} rows •{" "}
                            {
                              Object.keys(selectedFileData.content[0] || {})
                                .length
                            }{" "}
                            columns
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Export
                          </Button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View detailed information about this file</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[500px] rounded-md border">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                {Object.keys(
                                  selectedFileData.content[0] || {}
                                ).map((key) => (
                                  <TableHead
                                    key={key}
                                    className="p-3 text-xs font-medium text-muted-foreground whitespace-nowrap"
                                  >
                                    {key}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedFileData.content.map((row, index) => (
                                <TableRow
                                  key={index}
                                  className="hover:bg-muted/50 transition-colors"
                                >
                                  {Object.values(row).map(
                                    (value, cellIndex) => (
                                      <TableCell
                                        key={cellIndex}
                                        className="p-3 text-sm max-w-[200px] truncate"
                                        title={String(value)}
                                      >
                                        {value}
                                      </TableCell>
                                    )
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </ScrollArea>
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
