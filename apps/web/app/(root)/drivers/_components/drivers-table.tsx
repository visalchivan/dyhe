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
  LockOutlined,
} from "@ant-design/icons";
import { Driver } from "../../../../lib/api/drivers";
import { useDrivers, useDeleteDriver } from "../../../../hooks/useDrivers";
import { ColumnType } from "antd/es/table";
import { useAuth } from "../../../../contexts/AuthContext";
import { canCreate, canEdit, canDelete } from "../../../../lib/rbac";

const { Title } = Typography;
const { Search } = Input;

interface DriversTableProps {
  onCreateDriver: () => void;
  onEditDriver: (driver: Driver) => void;
  onViewDriver: (driver: Driver) => void;
  onChangePassword: (driver: Driver) => void;
}

export const DriversTable: React.FC<DriversTableProps> = ({
  onCreateDriver,
  onEditDriver,
  onViewDriver,
  onChangePassword,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");

  const { data, isLoading, refetch } = useDrivers({
    page: currentPage,
    limit: pageSize,
    search: searchText || undefined,
  });

  const deleteDriverMutation = useDeleteDriver();
  const { user } = useAuth();

  // Check permissions
  const canCreateDrivers = canCreate(user?.role, "drivers");
  const canEditDrivers = canEdit(user?.role, "drivers");
  const canDeleteDrivers = canDelete(user?.role, "drivers");

  const handleDelete = async (id: string) => {
    try {
      await deleteDriverMutation.mutateAsync(id);
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

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "ON_DUTY":
        return "blue";
      case "OFF_DUTY":
        return "orange";
      case "SUSPENDED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "INACTIVE":
        return "orange";
      case "SUSPENDED":
        return "red";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: Driver, b: Driver) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string | undefined) => email || <span style={{ color: "#999" }}>N/A</span>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Delivery Fee",
      dataIndex: "deliverFee",
      key: "deliverFee",
      render: (fee: number | string) => `$${Number(fee).toFixed(2)}`,
      sorter: (a: Driver, b: Driver) => a.deliverFee - b.deliverFee,
    },
    {
      title: "Driver Status",
      dataIndex: "driverStatus",
      key: "driverStatus",
      render: (status: string) => (
        <Tag color={getDriverStatusColor(status)}>{status}</Tag>
      ),
      filters: [
        { text: "Active", value: "ACTIVE" },
        { text: "On Duty", value: "ON_DUTY" },
        { text: "Off Duty", value: "OFF_DUTY" },
        { text: "Suspended", value: "SUSPENDED" },
      ],
      onFilter: (value: string, record: Driver) =>
        record.driverStatus === value,
    },
    {
      title: "Bank",
      dataIndex: "bank",
      key: "bank",
      render: (bank: string) => <Tag color="blue">{bank}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = getStatusColor(status);
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: "Active", value: "ACTIVE" },
        { text: "Inactive", value: "INACTIVE" },
        { text: "Suspended", value: "SUSPENDED" },
      ],
      onFilter: (value: string, record: Driver) => record.status === value,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: Driver, b: Driver) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 300,
      render: (_: unknown, record: Driver) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              size="large"
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onViewDriver(record)}
            />
          </Tooltip>
          {canEditDrivers && (
            <Tooltip title="Edit">
              <Button
                size="large"
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEditDriver(record)}
              />
            </Tooltip>
          )}
          {canEditDrivers && (
            <Tooltip title="Change Password">
              <Button
                size="large"
                type="text"
                icon={<LockOutlined />}
                onClick={() => onChangePassword(record)}
              />
            </Tooltip>
          )}
          {canDeleteDrivers && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Delete Driver"
                description="Are you sure you want to delete this driver? This action cannot be undone."
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
                  loading={deleteDriverMutation.isPending}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Drivers
          </Title>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Search drivers..."
              allowClear
              size="large"
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
            {canCreateDrivers && (
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={onCreateDriver}
              >
                Add Driver
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns as ColumnType<Driver>[]}
        dataSource={data?.drivers || []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data?.pagination.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} drivers`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size || 10);
          },
        }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};
