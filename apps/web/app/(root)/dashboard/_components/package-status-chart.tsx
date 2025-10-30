"use client";

import React from "react";
import { Card, Typography, Spin, Progress } from "antd";
import { PackageStatusDistribution } from "../../../../lib/api/dashboard";

const { Title } = Typography;

interface PackageStatusChartProps {
  distribution: PackageStatusDistribution[];
  loading?: boolean;
}

export const PackageStatusChart: React.FC<PackageStatusChartProps> = ({
  distribution,
  loading = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "gray";
      case "ON_DELIVERY":
        return "blue";
      case "DELIVERED":
        return "green";
      case "FAILED":
        return "red";
      case "RETURNED":
        return "purple";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "ON_DELIVERY":
        return "In Transit";
      case "DELIVERED":
        return "Delivered";
      case "FAILED":
        return "Failed";
      case "RETURNED":
        return "Returned";
      default:
        return status;
    }
  };

  const totalPackages = distribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0 }}>
          Package Status Distribution
        </Title>
      }
      style={{ borderRadius: 12 }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ padding: 16 }}>
          {distribution.map((item, index) => {
            const percentage =
              totalPackages > 0 ? (item.count / totalPackages) * 100 : 0;
            return (
              <div key={index} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontWeight: 500 }}>
                    {getStatusLabel(item.status)}
                  </span>
                  <span style={{ color: "#666" }}>
                    {item.count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  percent={percentage}
                  strokeColor={getStatusColor(item.status)}
                  showInfo={false}
                  style={{ marginBottom: 8 }}
                />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
