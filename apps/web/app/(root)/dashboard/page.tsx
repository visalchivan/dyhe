"use client";

import React from "react";
import { Card, Row, Col, Statistic, Typography, Space, Avatar } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  CarOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext";

const { Title, Text } = Typography;

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2}>Dashboard</Title>
          <Text type="secondary">
            Welcome back, {user?.name}! Here's what's happening with your
            platform.
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={1128}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Packages"
                value={93}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Drivers Online"
                value={24}
                prefix={<CarOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Merchants"
                value={156}
                prefix={<ShopOutlined />}
                valueStyle={{ color: "#eb2f96" }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title="User Profile"
              extra={<Avatar icon={<UserOutlined />} />}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>Name:</Text> {user?.name}
                </div>
                <div>
                  <Text strong>Email:</Text> {user?.email}
                </div>
                <div>
                  <Text strong>Username:</Text> {user?.username}
                </div>
                <div>
                  <Text strong>Role:</Text> {user?.role}
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Recent Activity">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>• User logged in successfully</div>
                <div>• Dashboard accessed</div>
                <div>• Authentication system working</div>
                <div>• TanStack Query integrated</div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default DashboardPage;
