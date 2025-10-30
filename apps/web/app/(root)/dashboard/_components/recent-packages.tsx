"use client";

import React from "react";
import { Card, Table, Tag, Typography, Spin } from "antd";
import { RecentPackage } from "../../../../lib/api/dashboard";

const { Title } = Typography;

interface RecentPackagesProps {
  packages: RecentPackage[];
  loading?: boolean;
}

export const RecentPackages: React.FC<RecentPackagesProps> = ({
  packages,
  loading = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "green";
      case "ON_DELIVERY":
        return "blue";
      case "PENDING":
        return "default";
      case "FAILED":
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
      render: (text: string) => (
        <Typography.Text code copyable>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: "Merchant",
      key: "merchant",
      render: (_: any, record: RecentPackage) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.merchant.name}</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {record.merchant.email}
          </div>
        </div>
      ),
    },
    {
      title: "Driver",
      key: "driver",
      render: (_: any, record: RecentPackage) =>
        record.driver ? (
          <div>
            <div style={{ fontWeight: 500 }}>{record.driver.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {record.driver.email}
            </div>
          </div>
        ) : (
          <Typography.Text type="secondary">Not assigned</Typography.Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0 }}>
          Recent Packages
        </Title>
      }
      style={{ borderRadius: 12 }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={packages}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 600 }}
        />
      )}
    </Card>
  );
};
