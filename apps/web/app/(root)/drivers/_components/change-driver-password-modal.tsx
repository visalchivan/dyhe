"use client";

import React from "react";
import { Modal, Form, Input, Button, Space } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { Driver } from "../../../../lib/api/drivers";
import { useChangeDriverPassword } from "../../../../hooks/useDrivers";

interface ChangeDriverPasswordModalProps {
  driver: Driver | null;
  visible: boolean;
  onClose: () => void;
}

export const ChangeDriverPasswordModal: React.FC<
  ChangeDriverPasswordModalProps
> = ({ driver, visible, onClose }) => {
  const [form] = Form.useForm();
  const changePasswordMutation = useChangeDriverPassword();

  const handleSubmit = async (values: { newPassword: string }) => {
    if (!driver) return;

    try {
      await changePasswordMutation.mutateAsync({
        id: driver.id,
        newPassword: values.newPassword,
      });
      form.resetFields();
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <LockOutlined />
          <span>Change Password: {driver?.name}</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: "Please enter new password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password
            placeholder="Enter new password"
            size="large"
            prefix={<LockOutlined />}
          />
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
          <Input.Password
            placeholder="Confirm new password"
            size="large"
            prefix={<LockOutlined />}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Space>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={changePasswordMutation.isPending}
              icon={<LockOutlined />}
            >
              Change Password
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
