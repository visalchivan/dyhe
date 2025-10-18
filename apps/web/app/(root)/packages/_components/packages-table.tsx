"use client";

import {
  AppstoreAddOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PrinterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Input,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { ColumnType } from "antd/es/table";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useDeletePackage, usePackages } from "../../../../hooks/usePackages";
import { Package } from "../../../../lib/api/packages";
import { canCreate, canDelete, canEdit } from "../../../../lib/rbac";
import { printLabel } from "../../../../lib/utils/directPrint";

const { Title } = Typography;
const { Search } = Input;

interface PackagesTableProps {
  onCreatePackage: () => void;
  onBulkCreatePackages: () => void;
  onEditPackage: (packageData: Package) => void;
  onViewPackage: (packageData: Package) => void;
}

export const PackagesTable: React.FC<PackagesTableProps> = ({
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
  const { user } = useAuth();

  // Check permissions
  const canCreatePackages = canCreate(user?.role, "packages");
  const canEditPackages = canEdit(user?.role, "packages");
  const canDeletePackages = canDelete(user?.role, "packages");

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

  const handlePrintLabel = useCallback(async (packageData: Package) => {
    try {
      await printLabel({
        id: packageData.id,
        packageNumber: packageData.packageNumber,
        name: packageData.name,
        customerName: packageData.customerName,
        customerPhone: packageData.customerPhone,
        customerAddress: packageData.customerAddress,
        codAmount: packageData.codAmount,
        merchant: { name: packageData.merchant.name },
      });
    } catch (error) {
      console.error("Error printing label:", error);
    }
  }, []);

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
        fixed: "left",
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
        fixed: "right",
        width: 250,
        render: (_: unknown, record: Package) => {
          return (
            <Space size="small">
              <Tooltip title="View Details">
                <Button
                  size="large"
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => onViewPackage(record)}
                />
              </Tooltip>
              <Tooltip title="Print Label">
                <Button
                  size="large"
                  type="text"
                  icon={<PrinterOutlined />}
                  onClick={() => handlePrintLabel(record)}
                />
              </Tooltip>
              {canEditPackages && (
                <Tooltip title="Edit">
                  <Button
                    size="large"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => onEditPackage(record)}
                  />
                </Tooltip>
              )}
              {canDeletePackages && (
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
                      size="large"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      loading={deletePackageMutation.isPending}
                    />
                  </Popconfirm>
                </Tooltip>
              )}
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
      canEditPackages,
      canDeletePackages,
    ]
  );

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Packages
          </Title>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Search packages..."
              size="large"
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
            <Link href="/packages/print">
              <Button type="default" icon={<PrinterOutlined />} size="large">
                Print Label
              </Button>
            </Link>
            {canCreatePackages && (
              <Button
                type="primary"
                size="large"
                icon={<AppstoreAddOutlined />}
                onClick={onBulkCreatePackages}
              >
                Bulk Create
              </Button>
            )}
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
