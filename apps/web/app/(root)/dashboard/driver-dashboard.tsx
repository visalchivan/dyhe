"use client";

import React from "react";
import { Card, Row, Col, Statistic, Typography, Spin, Tag } from "antd";
import {
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  GiftOutlined,
  RollbackOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { useDriverStats } from "../../../hooks/useDriverPackages";

const { Title, Text } = Typography;

export const DriverDashboard: React.FC = () => {
  const { data: stats, isLoading } = useDriverStats();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Packages",
      value: stats?.total || 0,
      icon: <GiftOutlined style={{ fontSize: 40, color: "#1890ff" }} />,
      color: "#1890ff",
      bgColor: "#e6f7ff",
    },
    {
      title: "Delivering",
      value: stats?.delivering || 0,
      icon: <TruckOutlined style={{ fontSize: 40, color: "#faad14" }} />,
      color: "#faad14",
      bgColor: "#fffbe6",
    },
    {
      title: "Delivered",
      value: stats?.delivered || 0,
      icon: <CheckCircleOutlined style={{ fontSize: 40, color: "#52c41a" }} />,
      color: "#52c41a",
      bgColor: "#f6ffed",
    },
    {
      title: "Returned",
      value: stats?.returned || 0,
      icon: <RollbackOutlined style={{ fontSize: 40, color: "#ff7a45" }} />,
      color: "#ff7a45",
      bgColor: "#fff2e8",
    },
    {
      title: "Cancelled",
      value: stats?.cancelled || 0,
      icon: <CloseCircleOutlined style={{ fontSize: 40, color: "#f5222d" }} />,
      color: "#f5222d",
      bgColor: "#fff1f0",
    },
    {
      title: "Today Delivered",
      value: stats?.todayDelivered || 0,
      icon: <CarOutlined style={{ fontSize: 40, color: "#722ed1" }} />,
      color: "#722ed1",
      bgColor: "#f9f0ff",
    },
  ];

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Title level={isMobile ? 3 : 2}>
          <CarOutlined /> {isMobile ? "Dashboard" : "Driver Dashboard"}
        </Title>
        <Text type="secondary">
          {isMobile
            ? "Your deliveries overview"
            : "Welcome back! Here's an overview of your deliveries."}
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[12, 12]} style={{ marginBottom: isMobile ? 16 : 24 }}>
        {statCards.map((stat, index) => (
          <Col xs={12} sm={12} md={8} lg={8} xl={4} key={index}>
            <Card
              hoverable
              style={{
                borderLeft: `4px solid ${stat.color}`,
                backgroundColor: stat.bgColor,
                height: "100%",
              }}
              styles={{ body: { padding: isMobile ? 12 : 24 } }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "center",
                  gap: isMobile ? 8 : 0,
                }}
              >
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  valueStyle={{
                    color: stat.color,
                    fontWeight: "bold",
                    fontSize: isMobile ? 20 : 24,
                  }}
                  style={{ flex: 1 }}
                />
                <div style={{ fontSize: isMobile ? 28 : 40 }}>{stat.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* COD Summary */}
      <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <DollarOutlined />{" "}
                {isMobile ? "COD Collected" : "Total COD Collected"}
              </span>
            }
            style={{
              borderTop: "4px solid #13c2c2",
            }}
            styles={{ body: { padding: isMobile ? 16 : 24 } }}
          >
            <Statistic
              value={stats?.totalCOD || 0}
              precision={2}
              prefix="$"
              valueStyle={{
                color: "#13c2c2",
                fontSize: isMobile ? 28 : 32,
                fontWeight: "bold",
              }}
            />
            <div style={{ marginTop: isMobile ? 12 : 16 }}>
              <Text type="secondary">
                From {stats?.delivered || 0} delivered packages
              </Text>
            </div>
          </Card>
        </Col>

        {/* Quick Stats */}
        <Col xs={24} lg={12}>
          <Card
            title={isMobile ? "📊 Stats" : "Quick Stats"}
            style={{
              borderTop: "4px solid #52c41a",
            }}
            styles={{ body: { padding: isMobile ? 16 : 24 } }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? 12 : 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: isMobile ? 14 : 16 }}>
                  Success Rate
                </Text>
                <Tag
                  color="success"
                  style={{
                    fontSize: isMobile ? 14 : 16,
                    padding: isMobile ? "2px 8px" : "4px 12px",
                  }}
                >
                  {stats?.total
                    ? (((stats.delivered || 0) / stats.total) * 100).toFixed(1)
                    : 0}
                  %
                </Tag>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: isMobile ? 14 : 16 }}>
                  In Progress
                </Text>
                <Tag
                  color="processing"
                  style={{
                    fontSize: isMobile ? 14 : 16,
                    padding: isMobile ? "2px 8px" : "4px 12px",
                  }}
                >
                  {stats?.delivering || 0}
                </Tag>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: isMobile ? 14 : 16 }}>
                  Today's Deliveries
                </Text>
                <Tag
                  color="purple"
                  style={{
                    fontSize: isMobile ? 14 : 16,
                    padding: isMobile ? "2px 8px" : "4px 12px",
                  }}
                >
                  {stats?.todayDelivered || 0}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
