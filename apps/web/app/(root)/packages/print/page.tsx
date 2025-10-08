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
import {
  createLabelPdf,
  createBulkLabelsPdf,
  openPdfInNewTab,
} from "../../../../lib/utils/pdfLabel";
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

  const handlePrint = async () => {
    if (!selectedPackage) return;

    setIsPrinting(true);

    try {
      // Find the selected package
      const packageToPrint = packagesData?.packages.find(
        (pkg: any) => pkg.id === selectedPackage
      );
      if (!packageToPrint) {
        setIsPrinting(false);
        return;
      }

      const doc = await createLabelPdf({
        id: packageToPrint.id,
        packageNumber: packageToPrint.packageNumber,
        name: packageToPrint.name,
        customerName: packageToPrint.customerName,
        customerPhone: packageToPrint.customerPhone,
        customerAddress: packageToPrint.customerAddress,
        codAmount: packageToPrint.codAmount,
        merchant: { name: packageToPrint.merchant.name },
      });

      await openPdfInNewTab(doc);
      setIsPrinting(false);
    } catch (error) {
      console.error("Error printing label:", error);
      setIsPrinting(false);
    }
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

      if (packagesToPrint.length === 0) {
        setIsBulkPrinting(false);
        return;
      }

      const doc = await createBulkLabelsPdf(
        packagesToPrint.map((p: any) => ({
          id: p.id,
          packageNumber: p.packageNumber,
          name: p.name,
          customerName: p.customerName,
          customerPhone: p.customerPhone,
          customerAddress: p.customerAddress,
          codAmount: p.codAmount,
          merchant: { name: p.merchant.name },
        }))
      );

      await openPdfInNewTab(doc);
      setIsBulkPrinting(false);
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

  // generatePrintContent, generateBulkPrintContent remain for preview UI text; PDF path is used for actual prints

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <PrinterOutlined /> Package Label Printer
        </Title>
        <Text type="secondary">
          Generate and print package labels as 4x6in PDFs with QR codes
        </Text>

        <div style={{ marginTop: 16 }}>
          <Space>
            <Button
              type={printMode === "single" ? "primary" : "default"}
              onClick={() => setPrintMode("single")}
              size="large"
            >
              Single Print
            </Button>
            <Button
              type={printMode === "bulk" ? "primary" : "default"}
              onClick={() => setPrintMode("bulk")}
              size="large"
            >
              Bulk Print
            </Button>
          </Space>
        </div>
      </div>

      {printMode === "single" ? (
        <Row gutter={32}>
          <Col span={10}>
            <Card>
              <Title level={4}>Select Package to Print</Title>

              <Space
                direction="vertical"
                style={{ width: "100%", marginBottom: 20 }}
              >
                <Select
                  placeholder="Select a package to print"
                  value={selectedPackage}
                  onChange={setSelectedPackage}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="children"
                  loading={packagesLoading}
                  size="large"
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
                    description="Ready to generate PDF label for the selected package"
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
                    {isPrinting ? "Generating PDF..." : "Generate PDF Label"}
                  </Button>
                </Space>
              )}
            </Card>
          </Col>

          <Col span={14}>
            <PackageLabel />
          </Col>
        </Row>
      ) : (
        <Row gutter={32}>
          <Col span={14}>
            <Card>
              <Title level={4}>Select Packages (Bulk)</Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Input
                  placeholder="Search packages by name or package number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                  size="large"
                />

                <div>
                  <Checkbox
                    checked={
                      selectedPackages.length ===
                      (packagesData?.packages.length || 0)
                    }
                    indeterminate={
                      selectedPackages.length > 0 &&
                      selectedPackages.length <
                        (packagesData?.packages.length || 0)
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ fontSize: 16 }}
                  >
                    Select All ({packagesData?.packages.length || 0} packages)
                  </Checkbox>
                </div>

                <List
                  dataSource={packagesData?.packages || []}
                  renderItem={(pkg: any) => (
                    <List.Item
                      style={{
                        borderBottom: "1px solid #f0f0f0",
                        padding: "12px 0",
                      }}
                      actions={[
                        <Checkbox
                          key="select"
                          checked={selectedPackages.includes(pkg.id)}
                          onChange={(e) =>
                            handlePackageSelect(pkg.id, e.target.checked)
                          }
                        />,
                        <Tag key="status" color="blue">
                          {pkg.status}
                        </Tag>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Text strong style={{ fontSize: 15 }}>
                            {pkg.packageNumber} - {pkg.name}
                          </Text>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              {pkg.customerName} • {pkg.customerPhone}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              COD: ${Number(pkg.codAmount).toFixed(2)}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                  style={{ maxHeight: 400, overflowY: "auto" }}
                />

                {selectedPackages.length > 0 && (
                  <Button
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={handleBulkPrint}
                    loading={isBulkPrinting}
                    size="large"
                    style={{ width: "100%" }}
                  >
                    {isBulkPrinting
                      ? "Generating PDFs..."
                      : `Generate ${selectedPackages.length} PDF Label(s)`}
                  </Button>
                )}
              </Space>
            </Card>
          </Col>

          <Col span={10}>
            <Card>
              <Title level={4}>
                Selected Packages ({selectedPackages.length})
              </Title>
              {selectedPackages.length > 0 ? (
                <List
                  dataSource={
                    packagesData?.packages.filter((pkg: any) =>
                      selectedPackages.includes(pkg.id)
                    ) || []
                  }
                  renderItem={(pkg: any) => (
                    <List.Item
                      style={{
                        borderBottom: "1px solid #f0f0f0",
                        padding: "12px 0",
                      }}
                      actions={[
                        <Button
                          key="remove"
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveFromBulk(pkg.id)}
                          size="large"
                        />,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Text strong style={{ fontSize: 15 }}>
                            {pkg.packageNumber} - {pkg.name}
                          </Text>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              {pkg.customerName} • {pkg.customerPhone}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              COD: ${Number(pkg.codAmount).toFixed(2)}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                  style={{ maxHeight: 400, overflowY: "auto" }}
                />
              ) : (
                <div
                  style={{ textAlign: "center", padding: 40, color: "#999" }}
                >
                  <QrcodeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <div style={{ fontSize: 16 }}>No packages selected</div>
                  <div style={{ fontSize: 12, marginTop: 8 }}>
                    Select packages from the list on the left
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}

      <Card style={{ marginTop: 32 }}>
        <Title level={4}>Print Instructions</Title>
        <Space direction="vertical" size="middle">
          <div>
            <Text strong style={{ fontSize: 16 }}>
              Single/Bulk Printing:
            </Text>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>
                <Text>Select package(s) from the dropdown or list</Text>
              </li>
              <li>
                <Text>Click &quot;Generate PDF Label(s)&quot; button</Text>
              </li>
              <li>
                <Text>
                  Print from the PDF viewer using your system print dialog
                </Text>
              </li>
            </ul>
          </div>

          <Divider />

          <div>
            <Text strong style={{ fontSize: 16 }}>
              Label Specifications:
            </Text>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>
                <Text>Label size: 4&quot; x 6&quot; (101.6mm x 152.4mm)</Text>
              </li>
              <li>
                <Text>
                  Includes QR codes, tracking numbers, and all package details
                </Text>
              </li>
              <li>
                <Text>Each label prints on a separate page</Text>
              </li>
              <li>
                <Text>Optimized for thermal printers (Xprinter XP-480B)</Text>
              </li>
            </ul>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default PackagePrintPage;
