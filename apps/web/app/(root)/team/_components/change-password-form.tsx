"use client";

import React from "react";
import { Form, Input, Button, Space } from "antd";
import { ChangePasswordDto } from "../../../../lib/api/team";

interface ChangePasswordFormProps {
  onSubmit: (values: ChangePasswordDto) => void;
  loading?: boolean;
  onCancel: () => void;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: ChangePasswordDto) => {
    onSubmit(values);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="newPassword"
        label="New Password"
        rules={[
          { required: true, message: "Please enter new password" },
          { min: 6, message: "Password must be at least 6 characters" },
        ]}
      >
        <Input.Password placeholder="Enter new password" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Confirm Password"
        dependencies={["newPassword"]}
        rules={[
          { required: true, message: "Please confirm password" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Passwords do not match!"));
            },
          }),
        ]}
      >
        <Input.Password placeholder="Confirm new password" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Change Password
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
