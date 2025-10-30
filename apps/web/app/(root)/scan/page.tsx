"use client";

import React, { useState } from "react";
import { Card, Button, Typography, Space, Alert } from "antd";
import { QrcodeOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { PackageScanForm } from "./_components/package-scan-form";
import { ScannedPackagesList } from "./_components/scanned-packages-list";
import { packagesApi, Package } from "../../../lib/api/packages";

const { Title, Text } = Typography;

const ScanPackagePage = () => {
  const [scannedPackages, setScannedPackages] = useState<
    (Package & { scannedAt: string })[]
  >([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const handlePackageScanned = (
    packageData: Package & { scannedAt: string }
  ) => {
    // Check if package is already scanned
    const isAlreadyScanned = scannedPackages.some(
      (pkg) => pkg.packageNumber === packageData.packageNumber
    );

    if (isAlreadyScanned) {
      return; // Don't add duplicate
    }

    setScannedPackages((prev) => [...prev, packageData]);
  };

  const handleRemovePackage = (packageNumber: string) => {
    setScannedPackages((prev) =>
      prev.filter((pkg) => pkg.packageNumber !== packageNumber)
    );
  };

  const handleBulkAssign = async () => {
    if (!selectedDriver || scannedPackages.length === 0) {
      return;
    }

    setIsAssigning(true);
    try {
      const packageNumbers = scannedPackages.map((pkg) => pkg.packageNumber);

      const result = await packagesApi.bulkAssignPackages({
        driverId: selectedDriver,
        packageNumbers,
        status: "READY",
      });

      console.log("Assignment successful:", result);

      // Clear scanned packages after successful assignment
      setScannedPackages([]);
      setSelectedDriver(null);

      // Show success message (you can add a notification here)
      alert(`Successfully assigned ${result.count} packages to driver!`);
    } catch (error) {
      console.error("Assignment failed:", error);
      alert("Failed to assign packages. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div style={{ padding: '4px 22px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          Assign Packages
        </Title>
        <Text type="secondary">
          Manually enter package numbers to assign them to drivers in bulk
        </Text>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 32 }}
      >
        {/* Manual Entry Section */}
        <Card style={{ height: "fit-content" }}>
          <Title level={4}>Manual Entry</Title>
          <PackageScanForm
            onPackageScanned={handlePackageScanned}
            isScanning={isScanning}
            onScanningChange={setIsScanning}
          />
        </Card>

        {/* Scanned Packages Section */}
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Title level={4}>Scanned Packages ({scannedPackages.length})</Title>
            {scannedPackages.length > 0 && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleBulkAssign}
                disabled={!selectedDriver}
                loading={isAssigning}
                size="large"
              >
                {isAssigning ? "Assigning..." : "Assign to Driver"}
              </Button>
            )}
          </div>

          {scannedPackages.length === 0 ? (
            <Alert
              message="No packages scanned yet"
              description="Start adding packages using the manual entry form on the left"
              type="info"
              showIcon
              style={{ marginTop: 20 }}
            />
          ) : (
            <ScannedPackagesList
              packages={scannedPackages}
              onRemovePackage={handleRemovePackage}
              selectedDriver={selectedDriver}
              onDriverSelect={setSelectedDriver}
            />
          )}
        </Card>
      </div>

      {scannedPackages.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>Assignment Summary</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text>
              <strong>Total Packages:</strong> {scannedPackages.length}
            </Text>
            <Text>
              <strong>Selected Driver:</strong>{" "}
              {selectedDriver ? "Driver Selected" : "No Driver Selected"}
            </Text>
            <Text>
              <strong>Status:</strong> Ready for assignment
            </Text>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default ScanPackagePage;
