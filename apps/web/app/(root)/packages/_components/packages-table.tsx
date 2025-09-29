"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Input,
  Row,
  Col,
  Typography,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  AppstoreAddOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Package } from "../../../../lib/api/packages";
import { usePackages, useDeletePackage } from "../../../../hooks/usePackages";
import { ColumnType } from "antd/es/table";
import Link from "next/link";

const { Title } = Typography;
const { Search } = Input;

interface PackagesTableProps {
  onCreatePackage: () => void;
  onBulkCreatePackages: () => void;
  onEditPackage: (packageData: Package) => void;
  onViewPackage: (packageData: Package) => void;
}

export const PackagesTable: React.FC<PackagesTableProps> = ({
  onCreatePackage,
  onBulkCreatePackages,
  onEditPackage,
  onViewPackage,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");

  const { data, isLoading, refetch } = usePackages({
    page: currentPage,
    limit: pageSize,
    search: searchText || undefined,
  });

  const deletePackageMutation = useDeletePackage();

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deletePackageMutation.mutateAsync(id);
      } catch {
        // Error is handled by the mutation
      }
    },
    [deletePackageMutation]
  );

  const generatePrintContent = useCallback((packageData: Package) => {
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
  }, []);

  const handlePrintLabel = useCallback(
    (packageData: Package) => {
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      // Generate the print content
      const printContent = generatePrintContent(packageData);

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    },
    [generatePrintContent]
  );

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refetch();
  };

  const statusColorMap = useMemo(
    () => ({
      DELIVERED: "green",
      DELIVERING: "blue",
      PREPARING: "orange",
      READY: "cyan",
      RECEIVED: "default",
      CANCELLED: "red",
      RETURNED: "purple",
    }),
    []
  );

  const getStatusColor = useCallback(
    (status: string) => {
      return statusColorMap[status as keyof typeof statusColorMap] || "default";
    },
    [statusColorMap]
  );

  const columns = useMemo(
    () => [
      {
        title: "Package Number",
        dataIndex: "packageNumber",
        key: "packageNumber",
        width: 200,
        render: (text: string) => (
          <Typography.Text code copyable>
            {text}
          </Typography.Text>
        ),
        sorter: (a: Package, b: Package) =>
          a.packageNumber.localeCompare(b.packageNumber),
      },
      {
        title: "Customer Name",
        dataIndex: "customerName",
        key: "customerName",
        width: 200,
        sorter: (a: Package, b: Package) =>
          a.customerName.localeCompare(b.customerName),
      },
      {
        title: "Customer Phone",
        dataIndex: "customerPhone",
        key: "customerPhone",
        width: 200,
        render: (text: string) => (
          <Typography.Text copyable>{text}</Typography.Text>
        ),
      },
      {
        title: "Customer Address",
        dataIndex: "customerAddress",
        key: "customerAddress",
        ellipsis: true,
      },
      {
        title: "COD Amount",
        dataIndex: "codAmount",
        width: 150,
        key: "codAmount",
        render: (amount: number | string) => `$${Number(amount).toFixed(2)}`,
        sorter: (a: Package, b: Package) => a.codAmount - b.codAmount,
      },
      {
        title: "Delivery Fee",
        dataIndex: "deliveryFee",
        width: 150,
        key: "deliveryFee",
        render: (fee: number | string) => `$${Number(fee).toFixed(2)}`,
        sorter: (a: Package, b: Package) => a.deliveryFee - b.deliveryFee,
      },
      {
        title: "Merchant",
        key: "merchant",
        width: 150,
        render: (_: unknown, record: Package) => {
          return (
            <div>
              <div style={{ fontWeight: 500 }}>{record.merchant.name}</div>
            </div>
          );
        },
      },
      {
        title: "Driver",
        key: "driver",
        width: 150,
        render: (_: unknown, record: Package) => {
          return record.driver ? (
            <div>
              <div style={{ fontWeight: 500 }}>{record.driver.name}</div>
            </div>
          ) : (
            <Typography.Text type="secondary">Not assigned</Typography.Text>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 150,
        render: (status: string) => {
          const color = getStatusColor(status);
          return <Tag color={color}>{status}</Tag>;
        },
        filters: [
          { text: "Received", value: "RECEIVED" },
          { text: "Preparing", value: "PREPARING" },
          { text: "Ready", value: "READY" },
          { text: "Delivering", value: "DELIVERING" },
          { text: "Delivered", value: "DELIVERED" },
          { text: "Cancelled", value: "CANCELLED" },
          { text: "Returned", value: "RETURNED" },
        ],
        onFilter: (value: string, record: Package) => record.status === value,
      },
      {
        title: "Created",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 150,
        render: (date: string) => new Date(date).toLocaleDateString(),
        sorter: (a: Package, b: Package) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      },
      {
        title: "Actions",
        key: "actions",
        width: 150,
        render: (_: unknown, record: Package) => {
          return (
            <Space size="small">
              <Tooltip title="View Details">
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => onViewPackage(record)}
                />
              </Tooltip>
              <Tooltip title="Print Label">
                <Button
                  type="text"
                  icon={<PrinterOutlined />}
                  onClick={() => handlePrintLabel(record)}
                />
              </Tooltip>
              <Tooltip title="Edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEditPackage(record)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Popconfirm
                  title="Delete Package"
                  description="Are you sure you want to delete this package? This action cannot be undone."
                  onConfirm={() => handleDelete(record.id)}
                  okText="Yes"
                  cancelText="No"
                  okType="danger"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    loading={deletePackageMutation.isPending}
                  />
                </Popconfirm>
              </Tooltip>
            </Space>
          );
        },
      },
    ],
    [
      getStatusColor,
      onViewPackage,
      onEditPackage,
      handleDelete,
      handlePrintLabel,
      deletePackageMutation.isPending,
    ]
  );

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            Packages
          </Title>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Search packages..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
            <Link href="/packages/print">
              <Button type="default" icon={<PrinterOutlined />}>
                Print Label
              </Button>
            </Link>
            <Button icon={<PlusOutlined />} onClick={onCreatePackage}>
              Create Package
            </Button>
            <Button
              type="primary"
              icon={<AppstoreAddOutlined />}
              onClick={onBulkCreatePackages}
            >
              Bulk Create
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns as ColumnType<Package>[]}
        dataSource={data?.packages || []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data?.pagination.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} packages`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size || 10);
          },
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};
