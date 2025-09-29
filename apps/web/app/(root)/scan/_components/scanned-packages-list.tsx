"use client";

import React from "react";
import {
  List,
  Button,
  Typography,
  Space,
  Tag,
  Select,
  Card,
  Divider,
} from "antd";
import { DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { useDrivers } from "../../../../hooks/useDrivers";
import { Package } from "../../../../lib/api/packages";

const { Title, Text } = Typography;
const { Option } = Select;

interface ScannedPackagesListProps {
  packages: (Package & { scannedAt: string })[];
  onRemovePackage: (packageNumber: string) => void;
  selectedDriver: string | null;
  onDriverSelect: (driverId: string) => void;
}

export const ScannedPackagesList: React.FC<ScannedPackagesListProps> = ({
  packages,
  onRemovePackage,
  selectedDriver,
  onDriverSelect,
}) => {
  const { data: driversData } = useDrivers({ limit: 100 });

  return (
    <div>
      {/* Driver Selection */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Title level={5}>
              <UserOutlined /> Select Driver
            </Title>
            <Text type="secondary">
              Choose which driver to assign these packages to
            </Text>
          </div>
          <Select
            placeholder="Select a driver"
            value={selectedDriver}
            onChange={onDriverSelect}
            style={{ width: "100%" }}
            showSearch
            optionFilterProp="children"
          >
            {driversData?.drivers.map(
              (driver: {
                id: string;
                name: string;
                email?: string;
                phone?: string;
              }) => (
                <Option key={driver.id} value={driver.id}>
                  {driver.name} ({driver.email || driver.phone})
                </Option>
              )
            )}
          </Select>
        </Space>
      </Card>

      <Divider />

      {/* Packages List */}
      <List
        dataSource={packages}
        renderItem={(pkg, index) => (
          <List.Item
            actions={[
              <Button
                key="remove"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemovePackage(pkg.packageNumber)}
              >
                Remove
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>#{index + 1}</Text>
                  <Text code>{pkg.packageNumber}</Text>
                  <Tag color="blue">{pkg.status}</Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size="small">
                  <Text>{pkg.name}</Text>
                  <Text type="secondary">Customer: {pkg.customerName}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Scanned: {new Date(pkg.scannedAt).toLocaleString()}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
        locale={{
          emptyText: "No packages scanned yet",
        }}
      />

      {packages.length > 0 && (
        <Card style={{ marginTop: 16, backgroundColor: "#f6ffed" }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Title level={5} style={{ margin: 0, color: "#52c41a" }}>
              Ready for Assignment
            </Title>
            <Text type="secondary">
              {packages.length} package{packages.length !== 1 ? "s" : ""} ready
              to be assigned to{" "}
              {selectedDriver ? "selected driver" : "a driver"}
            </Text>
          </Space>
        </Card>
      )}
    </div>
  );
};
