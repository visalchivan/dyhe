"use client";

import React from "react";
import { Row, Col, Typography, Spin, DatePicker } from "antd";
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
import dayjs from "dayjs";
const { RangePicker } = DatePicker;

const { Title } = Typography;

export default function DashboardPage() {
  const { user } = useAuth();

  // Date range picker state, default to today
  const today = dayjs().format("YYYY-MM-DD");
  const [dateRange, setDateRange] = React.useState<[string, string]>([today, today]);
  const [startDate, endDate] = dateRange;

  // Show driver-specific dashboard for drivers
  if (user?.role === "DRIVER") {
    return <DriverDashboard />;
  }

  // useDashboard hooks accept date
  const { data: stats, isLoading: statsLoading } = useDashboardStats(startDate, endDate);
  const { data: recentPackages, isLoading: packagesLoading } = useRecentPackages(10, startDate, endDate);
  const { data: topMerchants, isLoading: merchantsLoading } = useTopMerchants(5);
  const { data: topDrivers, isLoading: driversLoading } = useTopDrivers(5);
  const { data: statusDistribution, isLoading: distributionLoading } = usePackageStatusDistribution(startDate, endDate);

  const isLoading =
    statsLoading ||
    packagesLoading ||
    merchantsLoading ||
    driversLoading ||
    distributionLoading;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <Title level={2} style={{ margin: 0 }}>
            Dashboard
          </Title>
          <Typography.Text type="secondary">
            Welcome to the DYHE Platform Dashboard
          </Typography.Text>
        </div>
        <RangePicker
          value={[dayjs(startDate, "YYYY-MM-DD"), dayjs(endDate, "YYYY-MM-DD")]}
          onChange={dates => {
            if (dates && dates[0] && dates[1]) {
              setDateRange([
                dates[0].format("YYYY-MM-DD"),
                dates[1].format("YYYY-MM-DD")
              ]);
            } else {
              setDateRange([today, today]);
            }
          }}
          allowClear={false}
        />
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
