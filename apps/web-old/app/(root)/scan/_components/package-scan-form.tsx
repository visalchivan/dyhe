"use client";

import React, { useState } from "react";
import { Button, Input, Typography, Space, Alert, Card, message } from "antd";
import { QrcodeOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

import { Package } from "../../../../lib/api/packages";

interface PackageScanFormProps {
  onPackageScanned: (packageData: Package & { scannedAt: string }) => void;
  isScanning: boolean;
  onScanningChange: (scanning: boolean) => void;
}

export const PackageScanForm: React.FC<PackageScanFormProps> = ({
  onPackageScanned,
}) => {
  const [scanResult, setScanResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleManualScan = () => {
    if (!scanResult.trim()) {
      setError("Please enter a package number");
      return;
    }

    // Simulate package data from scan
    const packageData = {
      id: `temp-${Date.now()}`,
      packageNumber: scanResult.trim(),
      name: `Package ${scanResult.trim()}`,
      customerName: "Scanned Customer",
      customerPhone: "N/A",
      customerAddress: "N/A",
      codAmount: 0,
      deliveryFee: 0,
      status: "READY",
      merchantId: "temp-merchant",
      merchant: {
        id: "temp-merchant",
        name: "Scanned Merchant",
        email: "merchant@example.com",
      },
      driverId: undefined,
      driver: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scannedAt: new Date().toISOString(),
    };

    onPackageScanned(packageData);
    setScanResult("");
    setError("");
    message.success(`Package ${scanResult.trim()} added successfully!`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleManualScan();
    }
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <Text type="secondary">
            Enter package number to add it to the scanned list
          </Text>
        </div>

        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="Enter package number (e.g., DYHE123456ABC)"
            value={scanResult}
            onChange={(e) => {
              setScanResult(e.target.value);
              setError("");
            }}
            onKeyPress={handleKeyPress}
            style={{ flex: 1 }}
            size="large"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleManualScan}
            size="large"
            style={{ minWidth: 120 }}
          >
            Add Package
          </Button>
        </Space.Compact>

        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            💡 Tip: Press Enter or click "Add Package" to add the package
          </Text>
        </div>
      </Space>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          style={{ marginTop: 16 }}
          showIcon
        />
      )}
    </div>
  );
};
