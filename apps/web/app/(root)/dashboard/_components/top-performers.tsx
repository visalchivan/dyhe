"use client";

import React from "react";
import { Card, List, Avatar, Typography, Spin, Row, Col, Tag } from "antd";
import { UserOutlined, ShopOutlined } from "@ant-design/icons";
import { TopMerchant, TopDriver } from "../../../../lib/api/dashboard";

const { Title, Text } = Typography;

interface TopPerformersProps {
  merchants: TopMerchant[];
  drivers: TopDriver[];
  loading?: boolean;
}

export const TopPerformers: React.FC<TopPerformersProps> = ({
  merchants,
  drivers,
  loading = false,
}) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShopOutlined style={{ color: "#1890ff" }} />
              <Title level={4} style={{ margin: 0 }}>
                Top Merchants
              </Title>
            </div>
          }
          style={{ borderRadius: 12 }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={merchants}
              renderItem={(merchant, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: "#1890ff",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    }
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <Text strong>{merchant.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {merchant.email}
                          </Text>
                        </div>
                        <Tag color="blue">
                          {merchant._count.packages} packages
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <UserOutlined style={{ color: "#52c41a" }} />
              <Title level={4} style={{ margin: 0 }}>
                Top Drivers
              </Title>
            </div>
          }
          style={{ borderRadius: 12 }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={drivers}
              renderItem={(driver, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: "#52c41a",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    }
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <Text strong>{driver.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {driver.email}
                          </Text>
                        </div>
                        <Tag color="green">
                          {driver._count.packages} deliveries
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </Col>
    </Row>
  );
};
