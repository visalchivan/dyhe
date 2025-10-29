"use client";

import React from "react";
import {
  Drawer,
  Descriptions,
  Tag,
  Typography,
  Button,
  Divider,
  Space,
} from "antd";
import { EditOutlined, CloseOutlined } from "@ant-design/icons";
import { Package } from "../../../../lib/api/packages";

const { Title, Text } = Typography;

interface PackageDrawerProps {
  packageData: Package | null;
  visible: boolean;
  onClose: () => void;
  onEdit: (packageData: Package) => void;
}

export const PackageDrawer: React.FC<PackageDrawerProps> = ({
  packageData,
  visible,
  onClose,
  onEdit,
}) => {
  if (!packageData) return null;

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

  return (
    <Drawer
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              Package Details
            </Title>
            <Tag color={getStatusColor(packageData.status)}>
              {packageData.status}
            </Tag>
          </Space>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={600}
      extra={
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => {
            onEdit(packageData);
            onClose();
          }}
        >
          Edit Package
        </Button>
      }
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={5}>Package Information</Title>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Package Number">
              <Text code copyable>
                {packageData.packageNumber}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Package Name">
              <Text strong>{packageData.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(packageData.status)}>
                {packageData.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(packageData.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {new Date(packageData.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        <div>
          <Title level={5}>Package & Customer Information</Title>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Package Name">
              <Text strong>{packageData.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Customer Name">
              <Text strong>{packageData.customerName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Customer Phone">
              <Text copyable>{packageData.customerPhone}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Customer Address">
              <Text>{packageData.customerAddress}</Text>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        <div>
          <Title level={5}>Financial Information</Title>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="COD Amount">
              <Text strong>${Number(packageData.codAmount).toFixed(2)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Delivery Fee">
              <Text strong>${Number(packageData.deliveryFee).toFixed(2)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              <Text strong style={{ color: "#1890ff" }}>
                $
                {(
                  Number(packageData.codAmount) +
                  Number(packageData.deliveryFee)
                ).toFixed(2)}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        <div>
          <Title level={5}>Assignment Information</Title>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Merchant">
              <div>
                <div style={{ fontWeight: 500 }}>
                  {packageData.merchant.name}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {packageData.merchant.email}
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Driver">
              {packageData.driver ? (
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {packageData.driver.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {packageData.driver.email}
                  </div>
                </div>
              ) : (
                <Text type="secondary">Not assigned</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Space>
    </Drawer>
  );
};
