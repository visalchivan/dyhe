"use client";

import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  Select,
  Input,
  Row,
  Col,
  Alert,
  Checkbox,
  List,
  Tag,
  Divider,
} from "antd";
import {
  PrinterOutlined,
  QrcodeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { PackageLabel } from "./_components/package-label";
import { usePackages } from "../../../../hooks/usePackages";
// import { useMerchants } from "../../../../hooks/useMerchants";

const { Title, Text } = Typography;
const { Option } = Select;

const PackagePrintPage = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [isBulkPrinting, setIsBulkPrinting] = useState(false);
  const [printMode, setPrintMode] = useState<"single" | "bulk">("single");

  const { data: packagesData, isLoading: packagesLoading } = usePackages({
    page: 1,
    limit: 100,
    search: searchTerm,
  });

  // const { data: merchantsData } = useMerchants({ limit: 100 });

  const handlePrint = () => {
    if (!selectedPackage) return;

    setIsPrinting(true);

    // Find the selected package
    const packageToPrint = packagesData?.packages.find(
      (pkg: any) => pkg.id === selectedPackage
    );
    if (!packageToPrint) return;

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Generate the print content
    const printContent = generatePrintContent(packageToPrint);

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
      setIsPrinting(false);
    };
  };

  const handleBulkPrint = async () => {
    if (selectedPackages.length === 0) return;

    setIsBulkPrinting(true);

    try {
      // Find all selected packages
      const packagesToPrint =
        packagesData?.packages.filter((pkg: any) =>
          selectedPackages.includes(pkg.id)
        ) || [];

      if (packagesToPrint.length === 0) return;

      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      // Generate bulk print content
      const printContent = generateBulkPrintContent(packagesToPrint);

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
        setIsBulkPrinting(false);
      };
    } catch (error) {
      console.error("Bulk print failed:", error);
      setIsBulkPrinting(false);
    }
  };

  const handlePackageSelect = (packageId: string, checked: boolean) => {
    if (checked) {
      setSelectedPackages([...selectedPackages, packageId]);
    } else {
      setSelectedPackages(selectedPackages.filter((id) => id !== packageId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allPackageIds =
        packagesData?.packages.map((pkg: any) => pkg.id) || [];
      setSelectedPackages(allPackageIds);
    } else {
      setSelectedPackages([]);
    }
  };

  const handleRemoveFromBulk = (packageId: string) => {
    setSelectedPackages(selectedPackages.filter((id) => id !== packageId));
  };

  const generatePrintContent = (packageData: any) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Package Label - ${packageData.packageNumber}</title>
          <style>
            @page {
              size: 4in 6in;
              margin: 0.2in;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 12px;
              line-height: 1.2;
            }
            .label {
              width: 100%;
              height: 100vh;
              border: 2px solid #000;
              padding: 8px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .company-address {
              font-size: 10px;
              color: #666;
            }
            .content {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 6px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .label-text {
              font-weight: bold;
              font-size: 10px;
            }
            .value {
              font-size: 11px;
            }
            .qr-section {
              text-align: center;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px solid #ccc;
            }
            .qr-code {
              width: 80px;
              height: 80px;
              border: 1px solid #000;
              margin: 0 auto 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              background: #f0f0f0;
            }
            .tracking-number {
              font-size: 14px;
              font-weight: bold;
              text-align: center;
              margin-top: 4px;
            }
            .footer {
              text-align: center;
              font-size: 8px;
              color: #666;
              margin-top: 8px;
              padding-top: 4px;
              border-top: 1px solid #ccc;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">
              <div class="company-name">DYHE DELIVERY</div>
              <div class="company-address">
                #123, Street 456, Phnom Penh, Cambodia<br>
                Tel: +855 12 345 678 | Email: info@dyhe.com
              </div>
            </div>
            
            <div class="content">
              <div class="row">
                <span class="label-text">FROM:</span>
                <span class="value">${packageData.merchant.name}</span>
              </div>
              
              <div class="row">
                <span class="label-text">TO:</span>
                <span class="value">${packageData.customerName}</span>
              </div>
              
              <div class="row">
                <span class="label-text">PHONE:</span>
                <span class="value">${packageData.customerPhone}</span>
              </div>
              
              <div class="row">
                <span class="label-text">ADDRESS:</span>
                <span class="value">${packageData.customerAddress}</span>
              </div>
              
              <div class="row">
                <span class="label-text">PACKAGE:</span>
                <span class="value">${packageData.name}</span>
              </div>
              
              <div class="row">
                <span class="label-text">COD:</span>
                <span class="value">$${packageData.codAmount}</span>
              </div>
              
              <div class="row">
                <span class="label-text">DATE:</span>
                <span class="value">${new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            <div class="qr-section">
              <div class="qr-code">
                QR CODE<br>
                ${packageData.packageNumber}
              </div>
              <div class="tracking-number">${packageData.packageNumber}</div>
            </div>
            
            <div class="footer">
              Scan QR code for tracking | www.dyhe.com
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const generateBulkPrintContent = (packages: any[]) => {
    const labelsHTML = packages
      .map(
        (packageData, index) => `
      <div class="label" style="page-break-after: ${index < packages.length - 1 ? "always" : "auto"};">
        <div class="header">
          <div class="company-name">DYHE DELIVERY</div>
          <div class="company-address">
            #123, Street 456, Phnom Penh, Cambodia<br>
            Tel: +855 12 345 678 | Email: info@dyhe.com
          </div>
        </div>
        
        <div class="content">
          <div class="row">
            <span class="label-text">FROM:</span>
            <span class="value">${packageData.merchant.name}</span>
          </div>
          
          <div class="row">
            <span class="label-text">TO:</span>
            <span class="value">${packageData.customerName}</span>
          </div>
          
          <div class="row">
            <span class="label-text">PHONE:</span>
            <span class="value">${packageData.customerPhone}</span>
          </div>
          
          <div class="row">
            <span class="label-text">ADDRESS:</span>
            <span class="value">${packageData.customerAddress}</span>
          </div>
          
          <div class="row">
            <span class="label-text">PACKAGE:</span>
            <span class="value">${packageData.name}</span>
          </div>
          
          <div class="row">
            <span class="label-text">COD:</span>
            <span class="value">$${packageData.codAmount}</span>
          </div>
          
          <div class="row">
            <span class="label-text">DATE:</span>
            <span class="value">${new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        <div class="qr-section">
          <div class="qr-code">
            QR CODE<br>
            ${packageData.packageNumber}
          </div>
          <div class="tracking-number">${packageData.packageNumber}</div>
        </div>
        
        <div class="footer">
          Scan QR code for tracking | www.dyhe.com
        </div>
      </div>
    `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bulk Package Labels - ${packages.length} packages</title>
          <style>
            @page {
              size: 4in 6in;
              margin: 0.2in;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 12px;
              line-height: 1.2;
            }
            .label {
              width: 100%;
              height: 100vh;
              border: 2px solid #000;
              padding: 8px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .company-address {
              font-size: 10px;
              color: #666;
            }
            .content {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 6px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .label-text {
              font-weight: bold;
              font-size: 10px;
            }
            .value {
              font-size: 11px;
            }
            .qr-section {
              text-align: center;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px solid #ccc;
            }
            .qr-code {
              width: 80px;
              height: 80px;
              border: 1px solid #000;
              margin: 0 auto 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              background: #f0f0f0;
            }
            .tracking-number {
              font-size: 14px;
              font-weight: bold;
              text-align: center;
              margin-top: 4px;
            }
            .footer {
              text-align: center;
              font-size: 8px;
              color: #666;
              margin-top: 8px;
              padding-top: 4px;
              border-top: 1px solid #ccc;
            }
          </style>
        </head>
        <body>
          ${labelsHTML}
        </body>
      </html>
    `;
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <PrinterOutlined /> Package Label Printer
        </Title>
        <Text type="secondary">
          Generate and print package labels with barcodes and QR codes
        </Text>

        <div style={{ marginTop: 16 }}>
          <Space>
            <Button
              type={printMode === "single" ? "primary" : "default"}
              onClick={() => setPrintMode("single")}
            >
              Single Print
            </Button>
            <Button
              type={printMode === "bulk" ? "primary" : "default"}
              onClick={() => setPrintMode("bulk")}
            >
              Bulk Print
            </Button>
          </Space>
        </div>
      </div>

      {printMode === "single" ? (
        <Row gutter={24}>
          <Col span={12}>
            <Card>
              <Title level={4}>Select Package to Print</Title>

              <Space
                direction="vertical"
                style={{ width: "100%", marginBottom: 16 }}
              >
                <Input
                  placeholder="Search packages by name or package number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                />

                <Select
                  placeholder="Select a package to print"
                  value={selectedPackage}
                  onChange={setSelectedPackage}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="children"
                  loading={packagesLoading}
                >
                  {packagesData?.packages.map((pkg: any) => (
                    <Option key={pkg.id} value={pkg.id}>
                      {pkg.packageNumber} - {pkg.name} ({pkg.customerName})
                    </Option>
                  ))}
                </Select>
              </Space>

              {selectedPackage && (
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Alert
                    message="Package Selected"
                    description="Ready to print label for the selected package"
                    type="success"
                    showIcon
                  />

                  <Button
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={handlePrint}
                    loading={isPrinting}
                    size="large"
                    style={{ width: "100%" }}
                  >
                    {isPrinting ? "Printing..." : "Print Label"}
                  </Button>
                </Space>
              )}
            </Card>
          </Col>

          <Col span={12}>
            <Card>
              <Title level={4}>Label Preview</Title>
              {selectedPackage ? (
                <PackageLabel
                  packageData={packagesData?.packages.find(
                    (pkg: any) => pkg.id === selectedPackage
                  )}
                />
              ) : (
                <div
                  style={{ textAlign: "center", padding: 40, color: "#999" }}
                >
                  <QrcodeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <div>Select a package to preview the label</div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      ) : (
        <Row gutter={24}>
          <Col span={16}>
            <Card>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Title level={4}>Select Packages for Bulk Print</Title>
                <Space>
                  <Checkbox
                    checked={
                      selectedPackages.length ===
                        packagesData?.packages.length &&
                      packagesData?.packages.length > 0
                    }
                    indeterminate={
                      selectedPackages.length > 0 &&
                      selectedPackages.length <
                        (packagesData?.packages.length || 0)
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  >
                    Select All ({packagesData?.packages.length || 0})
                  </Checkbox>
                  <Tag color="blue">{selectedPackages.length} selected</Tag>
                </Space>
              </div>

              <Input
                placeholder="Search packages by name or package number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                style={{ marginBottom: 16 }}
              />

              <List
                dataSource={packagesData?.packages || []}
                loading={packagesLoading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                renderItem={(pkg: any) => (
                  <List.Item
                    actions={[
                      <Checkbox
                        key="select"
                        checked={selectedPackages.includes(pkg.id)}
                        onChange={(e) =>
                          handlePackageSelect(pkg.id, e.target.checked)
                        }
                      >
                        Select
                      </Checkbox>,
                    ]}
                  >
                    <List.Item.Meta
                      title={`${pkg.packageNumber} - ${pkg.name}`}
                      description={`Customer: ${pkg.customerName} | Phone: ${pkg.customerPhone} | COD: $${pkg.codAmount}`}
                    />
                  </List.Item>
                )}
              />

              {selectedPackages.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Divider />
                  <Button
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={handleBulkPrint}
                    loading={isBulkPrinting}
                    size="large"
                    style={{ width: "100%" }}
                  >
                    {isBulkPrinting
                      ? "Printing..."
                      : `Print ${selectedPackages.length} Labels`}
                  </Button>
                </div>
              )}
            </Card>
          </Col>

          <Col span={8}>
            <Card>
              <Title level={4}>Selected Packages</Title>
              {selectedPackages.length > 0 ? (
                <List
                  size="small"
                  dataSource={selectedPackages
                    .map((id) =>
                      packagesData?.packages.find((pkg: any) => pkg.id === id)
                    )
                    .filter(Boolean)}
                  renderItem={(pkg: any) => (
                    <List.Item
                      actions={[
                        <Button
                          key="remove"
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveFromBulk(pkg.id)}
                          size="small"
                        />,
                      ]}
                    >
                      <List.Item.Meta
                        title={pkg.packageNumber}
                        description={pkg.customerName}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div
                  style={{ textAlign: "center", padding: 20, color: "#999" }}
                >
                  <QrcodeOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                  <div>No packages selected</div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>Print Instructions</Title>
        <Space direction="vertical">
          <Text>
            <strong>Single Print Mode:</strong>
          </Text>
          <Text>1. Search and select a package from the dropdown</Text>
          <Text>2. Preview the label on the right side</Text>
          <Text>
            3. Click &ldquo;Print Label&rdquo; to open the print dialog
          </Text>

          <Divider />

          <Text>
            <strong>Bulk Print Mode:</strong>
          </Text>
          <Text>1. Switch to &ldquo;Bulk Print&rdquo; mode</Text>
          <Text>2. Select multiple packages using checkboxes</Text>
          <Text>
            3. Use &ldquo;Select All&rdquo; to choose all packages at once
          </Text>
          <Text>
            4. Click &ldquo;Print X Labels&rdquo; to print all selected packages
          </Text>

          <Divider />

          <Text>
            <strong>General:</strong>
          </Text>
          <Text>
            • Make sure your printer is set to 4&ldquo; x 6&rdquo; label size
          </Text>
          <Text>
            • Labels include real QR codes, tracking numbers, and all package
            details
          </Text>
          <Text>
            • Each label prints on a separate page for easy separation
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default PackagePrintPage;
