"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { useState } from "react";
import * as XLSX from "xlsx";

const PatientsSection = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedFileData, setSelectedFileData] = useState<
    FileData["content"] | null
  >(null);

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
    if (file) {
      if (
        !file.name.endsWith(".csv") &&
        !file.name.endsWith(".xlsx") &&
        !file.name.endsWith(".xls")
      ) {
        alert("Invalid file format. Please upload a CSV or Excel file.");
        return;
      }

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
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("Error parsing file. Please ensure it is properly formatted.");
      }
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
    setSelectedFileData(file.content);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-semibold text-center sm:text-left">
        Upload Your Patients Information
      </h1>

      {/* Upload Section */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="w-full sm:flex-1 text-sm"
        />
        <Button className="w-full sm:w-auto text-sm">
          <Upload className="mr-2 h-4 w-4" /> Import File
        </Button>
      </div>

      {/* File List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <Tooltip key={file.id}>
            <TooltipTrigger>
              <Card
                className="p-3 sm:p-4 cursor-pointer hover:shadow-lg"
                onClick={() => handleFileClick(file)}
              >
                <h3
                  className="font-bold text-sm sm:text-lg truncate"
                  title={file.name}
                >
                  {file.name}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Uploaded: {file.date}
                </p>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rows: {file.content.length}</p>
              <p>Columns: {Object.keys(file.content[0] || {}).length}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Selected File Data Table */}
      {selectedFileData && (
        <Card className="p-3 sm:p-4">
          <h2 className="text-lg font-medium mb-3 sm:mb-4 text-center sm:text-left">
            File Data
          </h2>
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-full table-fixed text-xs sm:text-sm">
              <TableHeader className="bg-gray-100">
                <TableRow>
                  {Object.keys(selectedFileData[0] || {}).map((key) => (
                    <TableHead
                      key={key}
                      className="sticky top-0 p-2 sm:p-3 text-left font-medium whitespace-nowrap bg-gray-100"
                    >
                      {key}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedFileData.map((row, index) => (
                  <TableRow
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    {Object.values(row).map((value, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        className="p-2 sm:p-3 text-left max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {!files.length && (
        <div className="text-center mt-6">
          <p className="text-red-500 text-sm sm:text-base">
            No files uploaded yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientsSection;
