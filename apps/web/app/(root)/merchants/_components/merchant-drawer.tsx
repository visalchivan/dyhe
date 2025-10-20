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
import { Merchant } from "../../../../lib/api/merchants";

const { Title, Text } = Typography;

interface MerchantDrawerProps {
  merchant: Merchant | null;
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const MerchantDrawer: React.FC<MerchantDrawerProps> = ({
  merchant,
  visible,
  onClose,
  onEdit,
}) => {
  if (!merchant) return null;

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
            {merchant.name}
          </Title>
          <Tag color={getStatusColor(merchant.status)}>{merchant.status}</Tag>
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
            {merchant.email && (
              <Descriptions.Item label="Email">
                <Text copyable>{merchant.email}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Phone">
              <Text copyable>{merchant.phone}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              <Text>{merchant.address}</Text>
            </Descriptions.Item>
            {merchant.googleMapsUrl && (
              <Descriptions.Item label="Google Maps">
                <a
                  href={merchant.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Google Maps
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>

        <Divider />

        <div>
          <Title level={5}>Business Information</Title>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Delivery Fee">
              <Text strong>${Number(merchant.deliverFee).toFixed(2)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(merchant.status)}>
                {merchant.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {new Date(merchant.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(merchant.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        <div>
          <Title level={5}>Banking Information</Title>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Bank">
              <Tag color="blue">{merchant.bank}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Account Number">
              <Text copyable>{merchant.bankAccountNumber}</Text>
            </Descriptions.Item>
            {merchant.bankAccountName && (
              <Descriptions.Item label="Account Name">
                <Text>{merchant.bankAccountName}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>

        {merchant.googleMapsUrl && (
          <>
            <Divider />

            <div>
              <Title level={5}>Location</Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Google Maps">
                  <a
                    href={merchant.googleMapsUrl}
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
