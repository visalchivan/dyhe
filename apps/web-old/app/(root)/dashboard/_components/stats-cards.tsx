"use client";

import React from "react";
import { Card, Row, Col, Statistic, Spin } from "antd";
import {
  InboxOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  ExclamationCircleOutlined,
  UndoOutlined,
} from "@ant-design/icons";

interface DashboardStats {
  totalReceived: number;
  totalDelivered: number;
  totalPending: number;
  onDelivery: number;
  totalFailed: number;
  totalReturned: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  loading = false,
}) => {
  if (loading) {
    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Col xs={24} sm={12} lg={8} xl={4} key={index}>
            <Card>
              <Spin />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  const statsData = [
    {
      title: "Total Received",
      value: stats.totalReceived,
      description: "Packages received",
      icon: <InboxOutlined style={{ color: "#1890ff" }} />,
      color: "#1890ff",
    },
    {
      title: "Total Delivered",
      value: stats.totalDelivered,
      description: "Successfully delivered",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      color: "#52c41a",
    },
    {
      title: "Total Pending",
      value: stats.totalPending,
      description: "Awaiting pickup",
      icon: <ClockCircleOutlined style={{ color: "#faad14" }} />,
      color: "#faad14",
    },
    {
      title: "On Delivery",
      value: stats.onDelivery,
      description: "Currently in transit",
      icon: <TruckOutlined style={{ color: "#722ed1" }} />,
      color: "#722ed1",
    },
    {
      title: "Total Failed",
      value: stats.totalFailed,
      description: "Failed deliveries",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      color: "#ff4d4f",
    },
    {
      title: "Total Returned",
      value: stats.totalReturned,
      description: "Returned packages",
      icon: <UndoOutlined style={{ color: "#fa8c16" }} />,
      color: "#fa8c16",
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {statsData.map((stat, index) => (
        <Col xs={24} sm={12} lg={8} xl={4} key={index}>
          <Card
            hoverable
            style={{
              borderRadius: 12,
              border: `2px solid ${stat.color}20`,
              background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}05 100%)`,
            }}
          >
            <Statistic
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {stat.icon}
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {stat.title}
                  </span>
                </div>
              }
              value={stat.value}
              valueStyle={{
                color: stat.color,
                fontSize: 28,
                fontWeight: "bold",
              }}
              suffix={
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  {stat.description}
                </div>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};
