"use client";

import React, { useState } from "react";
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
} from "@ant-design/icons";
import { Package } from "../../../../lib/api/packages";
import { usePackages, useDeletePackage } from "../../../../hooks/usePackages";
import { ColumnType } from "antd/es/table";

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

  const handleDelete = async (id: string) => {
    try {
      await deletePackageMutation.mutateAsync(id);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "green";
      case "DELIVERING":
        return "blue";
      case "PREPARING":
        return "orange";
      case "READY":
        return "cyan";
      case "RECEIVED":
        return "default";
      case "CANCELLED":
        return "red";
      case "RETURNED":
        return "purple";
      default:
        return "default";
    }
  };

  const columns = [
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
      render: (_: any, record: Package) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.merchant.name}</div>
        </div>
      ),
    },
    {
      title: "Driver",
      key: "driver",
      width: 150,
      render: (_: any, record: Package) =>
        record.driver ? (
          <div>
            <div style={{ fontWeight: 500 }}>{record.driver.name}</div>
          </div>
        ) : (
          <Typography.Text type="secondary">Not assigned</Typography.Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
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
      render: (_: any, record: Package) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onViewPackage(record)}
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
      ),
    },
  ];

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
