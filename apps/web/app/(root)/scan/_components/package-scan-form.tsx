"use client";

import React, { useRef, useState } from "react";
import { Button, Input, Typography, Space, Alert, Card, Divider } from "antd";
import {
  QrcodeOutlined,
  CameraOutlined,
  StopOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

import { Package } from "../../../../lib/api/packages";

interface PackageScanFormProps {
  onPackageScanned: (packageData: Package & { scannedAt: string }) => void;
  isScanning: boolean;
  onScanningChange: (scanning: boolean) => void;
}

export const PackageScanForm: React.FC<PackageScanFormProps> = ({
  onPackageScanned,
  isScanning,
  onScanningChange,
}) => {
  const [scanResult, setScanResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      setError("");
      onScanningChange(true);

      // For now, we'll use a simple input field for testing
      // In a real app, you'd integrate with a QR code scanner library like @zxing/library
      console.log("Starting camera for QR code scanning...");

      // Simulate scanning process
      setTimeout(() => {
        onScanningChange(false);
      }, 2000);
    } catch {
      setError("Failed to start camera. Please check permissions.");
      onScanningChange(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    onScanningChange(false);
  };

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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleManualScan();
    }
  };

  return (
    <div>
      {!isScanning ? (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Card>
            <Title level={5}>Camera Scanner</Title>
            <Text type="secondary">
              Use your device camera to scan QR codes on packages
            </Text>
            <br />
            <Button
              type="primary"
              icon={<CameraOutlined />}
              onClick={startScanning}
              style={{ marginTop: 12 }}
            >
              Start Camera Scanner
            </Button>
          </Card>

          <Divider>OR</Divider>

          <Card>
            <Title level={5}>Manual Entry</Title>
            <Text type="secondary">
              Enter package number manually if QR code is not readable
            </Text>
            <Space.Compact style={{ width: "100%", marginTop: 12 }}>
              <Input
                placeholder="Enter package number (e.g., DYHE123456ABC)"
                value={scanResult}
                onChange={(e) => setScanResult(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ flex: 1 }}
              />
              <Button
                type="primary"
                icon={<QrcodeOutlined />}
                onClick={handleManualScan}
              >
                Add Package
              </Button>
            </Space.Compact>
          </Card>
        </Space>
      ) : (
        <Card>
          <div style={{ textAlign: "center", padding: 20 }}>
            <CameraOutlined style={{ fontSize: 48, color: "#1890ff" }} />
            <Title level={4} style={{ marginTop: 16 }}>
              Scanning for QR Codes...
            </Title>
            <Text type="secondary">
              Point your camera at the package QR code
            </Text>
            <br />
            <Button
              icon={<StopOutlined />}
              onClick={stopScanning}
              style={{ marginTop: 16 }}
            >
              Stop Scanning
            </Button>
          </div>
        </Card>
      )}

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
