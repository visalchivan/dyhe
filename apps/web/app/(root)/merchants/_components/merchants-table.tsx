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
} from "@ant-design/icons";
import { Merchant } from "../../../../lib/api/merchants";
import {
  useMerchants,
  useDeleteMerchant,
} from "../../../../hooks/useMerchants";
import { ColumnType } from "antd/es/table";
import { useAuth } from "../../../../contexts/AuthContext";
import { canCreate, canEdit, canDelete } from "../../../../lib/rbac";

const { Title } = Typography;
const { Search } = Input;

interface MerchantsTableProps {
  onCreateMerchant: () => void;
  onEditMerchant: (merchant: Merchant) => void;
  onViewMerchant: (merchant: Merchant) => void;
}

export const MerchantsTable: React.FC<MerchantsTableProps> = ({
  onCreateMerchant,
  onEditMerchant,
  onViewMerchant,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");

  const { data, isLoading, refetch } = useMerchants({
    page: currentPage,
    limit: pageSize,
    search: searchText || undefined,
  });

  const deleteMerchantMutation = useDeleteMerchant();
  const { user } = useAuth();

  // Check permissions
  const canCreateMerchants = canCreate(user?.role, "merchants");
  const canEditMerchants = canEdit(user?.role, "merchants");
  const canDeleteMerchants = canDelete(user?.role, "merchants");

  const handleDelete = async (id: string) => {
    try {
      await deleteMerchantMutation.mutateAsync(id);
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

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: Merchant, b: Merchant) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
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
      sorter: (a: Merchant, b: Merchant) => a.deliverFee - b.deliverFee,
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
        const color =
          status === "ACTIVE"
            ? "green"
            : status === "INACTIVE"
              ? "orange"
              : "red";
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: "Active", value: "ACTIVE" },
        { text: "Inactive", value: "INACTIVE" },
        { text: "Suspended", value: "SUSPENDED" },
      ],
      onFilter: (value: string, record: Merchant) => record.status === value,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: Merchant, b: Merchant) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 250,
      render: (_: unknown, record: Merchant) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              size="large"
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onViewMerchant(record)}
            />
          </Tooltip>
          {canEditMerchants && (
            <Tooltip title="Edit">
              <Button
                size="large"
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEditMerchant(record)}
              />
            </Tooltip>
          )}
          {canDeleteMerchants && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Delete Merchant"
                description="Are you sure you want to delete this merchant? This action cannot be undone."
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
                  loading={deleteMerchantMutation.isPending}
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
            Merchants
          </Title>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Search merchants..."
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
            {canCreateMerchants && (
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={onCreateMerchant}
              >
                Add Merchant
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns as ColumnType<Merchant>[]}
        dataSource={data?.merchants || []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data?.pagination.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} merchants`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size || 10);
          },
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
};
