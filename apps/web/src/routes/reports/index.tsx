import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { CalendarIcon, Download, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useMerchants } from "@/hooks/useMerchants";
import { useDrivers } from "@/hooks/useDrivers";
import { toast } from "sonner";
import MainLayout from "@/layouts/MainLayout";
import Cookies from "js-cookie";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/reports/')({
  component: ReportsPage,
})

function ReportsPage() {
  const [reportType, setReportType] = useState<string>("packages");
  const [dateRange, setDateRange] = useState<string>("today");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>("all");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  const { data: merchantsData } = useMerchants({ page: 1, limit: 1000 });
  const { data: driversData } = useDrivers({ page: 1, limit: 1000 });

  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case "today":
        return {
          startDate: today.toISOString(),
          endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(),
        };
      case "yesterday":
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          startDate: yesterday.toISOString(),
          endDate: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(),
        };
      case "thisWeek":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return {
          startDate: startOfWeek.toISOString(),
          endDate: endOfWeek.toISOString(),
        };
      case "thisMonth":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        return {
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString(),
        };
      case "custom":
        if (!customStartDate || !customEndDate) {
          throw new Error("Please select custom date range");
        }
        return {
          startDate: customStartDate.toISOString(),
          endDate: new Date(customEndDate.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(),
        };
      default:
        return {
          startDate: today.toISOString(),
          endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(),
        };
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const { startDate, endDate } = getDateRange();
      
      // Build query parameters
      const params = new URLSearchParams({
        startDate,
        endDate,
        type: reportType,
      });

      if (selectedMerchantId && selectedMerchantId !== "all") {
        params.append("merchantId", selectedMerchantId);
      }

      if (selectedDriverId && selectedDriverId !== "all") {
        params.append("driverId", selectedDriverId);
      }

      // Create download URL
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const downloadUrl = `${baseUrl}/reports/export/excel?${params.toString()}`;

      // Download with authentication
      const token = Cookies.get("accessToken");
      if (!token) {
        toast.error("Please log in to export reports");
        return;
      }

      // Use fetch with authentication headers
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `DeliveryReport_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Report exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  const handleMerchantExport = async () => {
    try {
      setIsExporting(true);
      
      const { startDate, endDate } = getDateRange();
      
      const params = new URLSearchParams({
        startDate,
        endDate,
        type: "merchants",
      });

      if (selectedMerchantId && selectedMerchantId !== "all") {
        params.append("merchantId", selectedMerchantId);
      }

      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const downloadUrl = `${baseUrl}/reports/export/excel?${params.toString()}`;

      // Download with authentication
      const token = Cookies.get("accessToken");
      if (!token) {
        toast.error("Please log in to export reports");
        return;
      }

      // Use fetch with authentication headers
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `MerchantReport_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Merchant report exported successfully!");
    } catch (error) {
      console.error("Merchant export error:", error);
      toast.error("Failed to export merchant report");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDriverExport = async () => {
    try {
      setIsExporting(true);
      
      const { startDate, endDate } = getDateRange();
      
      const params = new URLSearchParams({
        startDate,
        endDate,
        type: "drivers",
      });

      if (selectedDriverId && selectedDriverId !== "all") {
        params.append("driverId", selectedDriverId);
      }

      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const downloadUrl = `${baseUrl}/reports/export/excel?${params.toString()}`;

      // Download with authentication
      const token = Cookies.get("accessToken");
      if (!token) {
        toast.error("Please log in to export reports");
        return;
      }

      // Use fetch with authentication headers
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `DriverReport_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Driver report exported successfully!");
    } catch (error) {
      console.error("Driver export error:", error);
      toast.error("Failed to export driver report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <MainLayout>
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup className="space-y-4">
                {/* Report Type */}
                <Field>
                  <FieldLabel htmlFor="reportType">Report Type</FieldLabel>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="packages">Package Reports</SelectItem>
                      <SelectItem value="merchants">Merchant Reports</SelectItem>
                      <SelectItem value="drivers">Driver Reports</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {/* Date Range */}
                <Field>
                  <FieldLabel htmlFor="dateRange">Date Range</FieldLabel>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="thisWeek">This Week</SelectItem>
                      <SelectItem value="thisMonth">This Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {/* Custom Date Range */}
                {dateRange === "custom" && (
                  <FieldGroup className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Start Date</FieldLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !customStartDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {customStartDate ? (
                              format(customStartDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={customStartDate}
                            onSelect={setCustomStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </Field>
                    <Field>
                      <FieldLabel>End Date</FieldLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !customEndDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {customEndDate ? (
                              format(customEndDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={customEndDate}
                            onSelect={setCustomEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </Field>
                  </FieldGroup>
                )}

                {/* Merchant Filter */}
                {reportType === "packages" && (
                  <Field>
                    <FieldLabel htmlFor="merchant">Filter by Merchant (Optional)</FieldLabel>
                    <Select value={selectedMerchantId} onValueChange={setSelectedMerchantId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select merchant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Merchants</SelectItem>
                        {merchantsData?.merchants.map((merchant) => (
                          <SelectItem key={merchant.id} value={merchant.id}>
                            {merchant.name} - {merchant.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                {/* Driver Filter */}
                {(reportType === "packages" || reportType === "drivers") && (
                  <Field>
                    <FieldLabel htmlFor="driver">Filter by Driver (Optional)</FieldLabel>
                    <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Drivers</SelectItem>
                        {driversData?.drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name} - {driver.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Export Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* Main Export Button */}
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full"
                size="lg"
              >
                <FileSpreadsheet className="mr-2 h-5 w-5" />
                {isExporting ? "Exporting..." : `Export ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`}
              </Button>

              {/* Merchant Export */}
              <Button
                onClick={handleMerchantExport}
                disabled={isExporting}
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Merchant Report
              </Button>

              {/* Driver Export */}
              <Button
                onClick={handleDriverExport}
                disabled={isExporting}
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Driver Report
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>• Reports will be exported as Excel (.xlsx) files</p>
              <p>• Files include detailed package information</p>
              <p>• Khmer text is supported in exports</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </MainLayout>
  );
}