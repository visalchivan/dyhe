"use client";

import React, { useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Spin,
  Result,
} from "antd";
import { SaveOutlined, SettingOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useSettings, useUpdateSettings } from "../../../hooks/useSettings";
import { useAuth } from "../../../contexts/AuthContext";
import { isAdmin } from "../../../lib/rbac";

const { Title, Text } = Typography;

const SettingsPage = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: settings, isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const [form] = Form.useForm();

  // Check if user is admin
  const userIsAdmin = isAdmin(user?.role);

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && !userIsAdmin) {
      router.push("/dashboard");
    }
  }, [authLoading, userIsAdmin, router]);

  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings);
    }
  }, [settings, form]);

  const handleSubmit = async (values: Record<string, string>) => {
    try {
      await updateSettingsMutation.mutateAsync(values);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  // Show loading while checking auth
  if (authLoading || isLoading) {
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

  // Show access denied for non-admin users
  if (!userIsAdmin) {
    return (
      <div style={{ padding: 24 }}>
        <Result
          status="403"
          title="Access Denied"
          subTitle="Sorry, you don't have permission to access this page. Only administrators can view and modify settings."
          icon={<LockOutlined style={{ fontSize: 72, color: "#ff4d4f" }} />}
          extra={
            <Button type="primary" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 22px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          System Settings
        </Title>
        <Text type="secondary">
          Manage your company information and system preferences
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={settings}
      >
        {/* Company Information */}
        <Card title="Company Information" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="company_name"
                label="Company Name"
                rules={[
                  { required: true, message: "Please enter company name" },
                ]}
              >
                <Input size="large" placeholder="Enter company name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="company_phone"
                label="Company Phone"
                rules={[
                  { required: true, message: "Please enter company phone" },
                ]}
              >
                <Input size="large" placeholder="Enter company phone" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="company_address"
            label="Company Address"
            rules={[
              { required: true, message: "Please enter company address" },
            ]}
          >
            <Input.TextArea size="large"  rows={3} placeholder="Enter company address" />
          </Form.Item>
        </Card>

        {/* Label Settings */}
        <Card title="Label Settings" style={{ marginBottom: 24 }}>
          <Form.Item
            name="label_remarks"
            label="Label Remarks"
            rules={[{ required: true, message: "Please enter label remarks" }]}
          >
            <Input.TextArea
              size="large"
              rows={4}
              placeholder="Enter remarks that appear on package labels"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="label_company_name"
                label="Label Company Name"
                rules={[
                  {
                    required: true,
                    message: "Please enter label company name",
                  },
                ]}
              >
                <Input size="large" placeholder="Company name on labels" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="label_company_phone"
                label="Label Company Phone"
                rules={[
                  {
                    required: true,
                    message: "Please enter label company phone",
                  },
                ]}
              >
                <Input size="large" placeholder="Company phone on labels" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="label_company_address"
            label="Label Company Address"
            rules={[
              { required: true, message: "Please enter label company address" },
            ]}
          >
            <Input size="large" placeholder="Company address on labels" />
          </Form.Item>
        </Card>

        {/* System Settings */}
        <Card title="System Settings" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="default_delivery_fee"
                label="Default Delivery Fee ($)"
                rules={[
                  {
                    required: true,
                    message: "Please enter default delivery fee",
                  },
                  {
                    pattern: /^\d+(\.\d{1,2})?$/,
                    message: "Please enter a valid amount",
                  },
                ]}
              >
                <Input size="large" placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="default_cod_amount"
                label="Default COD Amount ($)"
                rules={[
                  {
                    required: true,
                    message: "Please enter default COD amount",
                  },
                  {
                    pattern: /^\d+(\.\d{1,2})?$/,
                    message: "Please enter a valid amount",
                  },
                ]}
              >
                <Input size="large" placeholder="0.00" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="timezone"
            label="Timezone"
            rules={[{ required: true, message: "Please enter timezone" }]}
          >
            <Input size="large" placeholder="Asia/Phnom_Penh" />
          </Form.Item>
        </Card>

        {/* Notification Settings */}
        <Card title="Notification Settings" style={{ marginBottom: 24 }}>
          <Form.Item
            name="notification_email"
            label="Notification Email"
            rules={[{ type: "email", message: "Please enter a valid email" }]}
          >
            <Input size="large" placeholder="admin@company.com" />
          </Form.Item>

          <Form.Item name="notification_phone" label="Notification Phone">
            <Input size="large" placeholder="+855 12 345 678" />
          </Form.Item>
        </Card>

        <Divider />

        <Form.Item style={{ textAlign: "right" }}>
          <Space>
            <Button size="large" onClick={() => form.resetFields()}>Reset</Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={updateSettingsMutation.isPending}
              size="large"
            >
              Save Settings
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SettingsPage;
