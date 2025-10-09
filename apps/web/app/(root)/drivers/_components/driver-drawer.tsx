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
import { EditOutlined, CloseOutlined } from "@ant-design/icons";
import { Driver } from "../../../../lib/api/drivers";

const { Title, Text } = Typography;

interface DriverDrawerProps {
  driver: Driver | null;
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const DriverDrawer: React.FC<DriverDrawerProps> = ({
  driver,
  visible,
  onClose,
  onEdit,
}) => {
  if (!driver) return null;

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

  return (
    <Drawer
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            {driver.name}
          </Title>
          <Tag color={getDriverStatusColor(driver.driverStatus)}>
            {driver.driverStatus}
          </Tag>
        </Space>
      }
      width={600}
      open={visible}
      onClose={onClose}
      extra={
        <Space>
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
          <Title level={5}>Contact Information</Title>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Email">
              <Text copyable>{driver.email}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              <Text copyable>{driver.phone}</Text>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        <div>
          <Title level={5}>Business Information</Title>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Delivery Fee">
              <Text strong>${Number(driver.deliverFee).toFixed(2)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Driver Status">
              <Tag color={getDriverStatusColor(driver.driverStatus)}>
                {driver.driverStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Account Status">
              <Tag color={getStatusColor(driver.status)}>{driver.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {new Date(driver.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(driver.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        <div>
          <Title level={5}>Banking Information</Title>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Bank">
              <Tag color="blue">{driver.bank}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Account Number">
              <Text copyable>{driver.bankAccountNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Account Name">
              <Text>{driver.bankAccountName}</Text>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {driver.googleMapsUrl && (
          <>
            <Divider />

            <div>
              <Title level={5}>Location</Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Google Maps">
                  <a
                    href={driver.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Google Maps
                  </a>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </>
        )}
      </Space>
    </Drawer>
  );
};
