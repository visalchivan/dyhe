"use client";

import React from "react";
import { Row, Col, Typography, Spin } from "antd";
import { useAuth } from "../../../contexts/AuthContext";
import { DriverDashboard } from "./driver-dashboard";
import { StatsCards } from "./_components/stats-cards";
import { RecentPackages } from "./_components/recent-packages";
import { TopPerformers } from "./_components/top-performers";
import { PackageStatusChart } from "./_components/package-status-chart";
import {
  useDashboardStats,
  useRecentPackages,
  useTopMerchants,
  useTopDrivers,
  usePackageStatusDistribution,
} from "../../../hooks/useDashboard";

const { Title } = Typography;

export default function DashboardPage() {
  const { user } = useAuth();

  // Show driver-specific dashboard for drivers
  if (user?.role === "DRIVER") {
    return <DriverDashboard />;
  }
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentPackages, isLoading: packagesLoading } =
    useRecentPackages(10);
  const { data: topMerchants, isLoading: merchantsLoading } =
    useTopMerchants(5);
  const { data: topDrivers, isLoading: driversLoading } = useTopDrivers(5);
  const { data: statusDistribution, isLoading: distributionLoading } =
    usePackageStatusDistribution();

  const isLoading =
    statsLoading ||
    packagesLoading ||
    merchantsLoading ||
    driversLoading ||
    distributionLoading;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Dashboard
        </Title>
        <Typography.Text type="secondary">
          Welcome to the DYHE Platform Dashboard
        </Typography.Text>
      </div>

      {isLoading && !stats ? (
        <div style={{ textAlign: "center", padding: 100 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: "#666" }}>
            Loading dashboard data...
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          {stats && <StatsCards stats={stats} loading={statsLoading} />}

          {/* Charts and Recent Activity */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <RecentPackages
                packages={recentPackages || []}
                loading={packagesLoading}
              />
            </Col>
            <Col xs={24} lg={8}>
              <PackageStatusChart
                distribution={statusDistribution || []}
                loading={distributionLoading}
              />
            </Col>
          </Row>

          {/* Top Performers */}
          <div style={{ marginTop: 24 }}>
            <TopPerformers
              merchants={topMerchants || []}
              drivers={topDrivers || []}
              loading={merchantsLoading || driversLoading}
            />
          </div>
        </>
      )}
    </div>
  );
}
