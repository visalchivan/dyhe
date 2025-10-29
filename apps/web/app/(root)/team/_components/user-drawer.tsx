"use client";

import React from "react";
import {
  Drawer,
  Descriptions,
  Tag,
  Space,
  Typography,
  Button,
  Divider,
} from "antd";
import { EditOutlined, CloseOutlined, KeyOutlined } from "@ant-design/icons";
import { User } from "../../../../lib/api/team";

const { Title, Text } = Typography;

interface UserDrawerProps {
  user: User | null;
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onChangePassword: () => void;
}

export const UserDrawer: React.FC<UserDrawerProps> = ({
  user,
  visible,
  onClose,
  onEdit,
  onChangePassword,
}) => {
  if (!user) return null;

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

  return (
    <Drawer
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            {user.name}
          </Title>
          <Tag color={getRoleColor(user.role)}>{user.role}</Tag>
        </Space>
      }
      width={600}
      open={visible}
      onClose={onClose}
      extra={
        <Space>
          <Button icon={<KeyOutlined />} onClick={onChangePassword}>
            Change Password
          </Button>
          <Button icon={<EditOutlined />} onClick={onEdit}>
            Edit
          </Button>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Close
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={5}>Personal Information</Title>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Username">
              <Text copyable>{user.username}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Full Name">
              <Text>{user.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Text copyable>{user.email}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              <Text copyable>{user.phone}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Gender">
              <Tag color="cyan">{user.gender}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        <div>
          <Title level={5}>Account Information</Title>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Role">
              <Tag color={getRoleColor(user.role)}>{user.role}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(user.status)}>{user.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {new Date(user.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(user.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Space>
    </Drawer>
  );
};
