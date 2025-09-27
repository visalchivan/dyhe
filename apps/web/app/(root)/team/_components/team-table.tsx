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
  KeyOutlined,
} from "@ant-design/icons";
import { User } from "../../../../lib/api/team";
import { useTeam, useDeleteUser } from "../../../../hooks/useTeam";
import { ColumnType } from "antd/es/table";

const { Title } = Typography;
const { Search } = Input;

interface TeamTableProps {
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
  onViewUser: (user: User) => void;
  onChangePassword: (user: User) => void;
}

export const TeamTable: React.FC<TeamTableProps> = ({
  onCreateUser,
  onEditUser,
  onViewUser,
  onChangePassword,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");

  const { data, isLoading, refetch } = useTeam({
    page: currentPage,
    limit: pageSize,
    search: searchText || undefined,
  });

  const deleteUserMutation = useDeleteUser();

  const handleDelete = async (id: string) => {
    try {
      await deleteUserMutation.mutateAsync(id);
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "red";
      case "ADMIN":
        return "purple";
      case "USER":
        return "blue";
      case "MERCHANT":
        return "green";
      case "DRIVER":
        return "orange";
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
      title: "Username",
      dataIndex: "username",
      key: "username",
      sorter: (a: User, b: User) => a.username.localeCompare(b.username),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: User, b: User) => a.name.localeCompare(b.name),
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
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag color={getRoleColor(role)}>{role}</Tag>,
      filters: [
        { text: "Super Admin", value: "SUPER_ADMIN" },
        { text: "Admin", value: "ADMIN" },
        { text: "User", value: "USER" },
        { text: "Merchant", value: "MERCHANT" },
        { text: "Driver", value: "DRIVER" },
      ],
      onFilter: (value: string, record: User) => record.role === value,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (gender: string) => <Tag color="cyan">{gender}</Tag>,
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
      onFilter: (value: string, record: User) => record.status === value,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: User, b: User) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onViewUser(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEditUser(record)}
            />
          </Tooltip>
          <Tooltip title="Change Password">
            <Button
              type="text"
              icon={<KeyOutlined />}
              onClick={() => onChangePassword(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete User"
              description="Are you sure you want to delete this user? This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              okType="danger"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deleteUserMutation.isPending}
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
            Team Members
          </Title>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Search team members..."
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreateUser}
            >
              Add Team Member
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns as ColumnType<User>[]}
        dataSource={data?.users || []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data?.pagination.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} team members`,
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
