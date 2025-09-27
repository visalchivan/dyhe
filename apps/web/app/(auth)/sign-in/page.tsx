"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Button, Form, Input, message, Card, Typography, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useLogin } from "../../../hooks/useAuth";

const { Title, Text } = Typography;

type FieldType = {
  emailOrUsername: string;
  password: string;
};

const SignInPage: React.FC = () => {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const loginMutation = useLogin();

  const onFinish = async (values: FieldType) => {
    try {
      await loginMutation.mutateAsync(values);
      message.success("Login successful!");
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
    message.error("Please fill in all required fields.");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              Welcome Back
            </Title>
            <Text type="secondary">Sign in to your account</Text>
          </div>

          <Form
            name="signin"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item<FieldType>
              label="Email or Username"
              name="emailOrUsername"
              rules={[
                {
                  required: true,
                  message: "Please input your email or username!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your email or username"
              />
            </Form.Item>

            <Form.Item<FieldType>
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loginMutation.isPending}
                style={{ width: "100%" }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary">
              Don't have an account?{" "}
              <a href="/sign-up" style={{ color: "#1890ff" }}>
                Sign up
              </a>
            </Text>
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Test accounts:
              <br />
              admin@dyhe.com / admin123 (Super Admin)
              <br />
              john.doe@example.com / password123 (User)
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default SignInPage;
