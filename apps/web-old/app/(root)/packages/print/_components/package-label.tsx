"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Typography, Space, Divider, Spin } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import { generateQRCode } from "../../../../../lib/utils/qrcode";

const { Text } = Typography;

interface PackageLabelProps {
  packageData?: {
    id: string;
    packageNumber: string;
    name: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    codAmount: number;
    merchant: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export const PackageLabel: React.FC<PackageLabelProps> = ({ packageData }) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const generateQRCodeForPackage = useCallback(async () => {
    if (!packageData?.packageNumber) return;

    setIsGeneratingQR(true);
    try {
      const qrCode = await generateQRCode(packageData.packageNumber, {
        width: 80,
        margin: 1,
      });
      setQrCodeDataURL(qrCode);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    } finally {
      setIsGeneratingQR(false);
    }
  }, [packageData?.packageNumber]);

  useEffect(() => {
    if (packageData?.packageNumber) {
      generateQRCodeForPackage();
    }
  }, [packageData?.packageNumber, generateQRCodeForPackage]);

  if (!packageData) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "300px",
        margin: "0 auto",
        border: "2px solid #000",
        padding: "12px",
        backgroundColor: "#fff",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        lineHeight: "1.2",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          borderBottom: "2px solid #000",
          paddingBottom: "8px",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "4px",
          }}
        >
          DYHE DELIVERY
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#666",
          }}
        >
          #123, Street 456, Phnom Penh, Cambodia
          <br />
          Tel: +855 12 345 678 | Email: info@dyhe.com
        </div>
      </div>

      {/* Content */}
      <div style={{ marginBottom: "12px" }}>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text strong style={{ fontSize: "10px" }}>
              FROM:
            </Text>
            <Text style={{ fontSize: "11px" }}>
              {packageData.merchant.name}
            </Text>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text strong style={{ fontSize: "10px" }}>
              TO:
            </Text>
            <Text style={{ fontSize: "11px" }}>{packageData.customerName}</Text>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text strong style={{ fontSize: "10px" }}>
              PHONE:
            </Text>
            <Text style={{ fontSize: "11px" }}>
              {packageData.customerPhone}
            </Text>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text strong style={{ fontSize: "10px" }}>
              ADDRESS:
            </Text>
            <Text style={{ fontSize: "11px" }}>
              {packageData.customerAddress}
            </Text>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text strong style={{ fontSize: "10px" }}>
              PACKAGE:
            </Text>
            <Text style={{ fontSize: "11px" }}>{packageData.name}</Text>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text strong style={{ fontSize: "10px" }}>
              COD:
            </Text>
            <Text style={{ fontSize: "11px" }}>${packageData.codAmount}</Text>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text strong style={{ fontSize: "10px" }}>
              DATE:
            </Text>
            <Text style={{ fontSize: "11px" }}>
              {new Date().toLocaleDateString()}
            </Text>
          </div>
        </Space>
      </div>

      <Divider style={{ margin: "8px 0" }} />

      {/* QR Code Section */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            border: "1px solid #000",
            margin: "0 auto 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            position: "relative",
          }}
        >
          {isGeneratingQR ? (
            <Spin size="small" />
          ) : qrCodeDataURL ? (
            <img
              src={qrCodeDataURL}
              alt="QR Code"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <div style={{ fontSize: "8px", textAlign: "center" }}>
              <QrcodeOutlined
                style={{ fontSize: "24px", marginBottom: "4px" }}
              />
              <div>QR CODE</div>
              <div style={{ fontSize: "6px", wordBreak: "break-all" }}>
                {packageData.packageNumber}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            textAlign: "center",
            marginTop: "4px",
            letterSpacing: "1px",
          }}
        >
          {packageData.packageNumber}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: "8px",
          color: "#666",
          marginTop: "8px",
          paddingTop: "4px",
          borderTop: "1px solid #ccc",
        }}
      >
        Scan QR code for tracking | www.dyhe.com
      </div>
    </div>
  );
};
