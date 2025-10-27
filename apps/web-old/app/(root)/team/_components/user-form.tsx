"use client";

import React from "react";
import { Form, Input, Select, Button, Space, Row, Col } from "antd";
import { CreateUserDto, UpdateUserDto, User } from "../../../../lib/api/team";

const { Option } = Select;

interface UserFormProps {
  user?: User;
  onSubmit: (values: CreateUserDto | UpdateUserDto) => void;
  loading?: boolean;
  onCancel: () => void;
}

const roleOptions = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
  { value: "MERCHANT", label: "Merchant" },
  { value: "DRIVER", label: "Driver" },
];

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
  }, [user, form]);

  const handleSubmit = (values: CreateUserDto | UpdateUserDto) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        role: "USER",
        gender: "MALE",
        status: "ACTIVE",
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: "Please enter username" },
              { min: 3, message: "Username must be at least 3 characters" },
              { max: 20, message: "Username must be less than 20 characters" },
            ]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: "Please enter full name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "Please enter phone number" },
              {
                pattern: /^[+]?[0-9\s-()]+$/,
                message: "Please enter a valid phone number",
              },
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
        </Col>
      </Row>

      {!user && (
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Please enter password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
      )}

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select role" }]}
          >
            <Select placeholder="Select role">
              {roleOptions.map((role) => (
                <Option key={role.value} value={role.value}>
                  {role.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Please select gender" }]}
          >
            <Select placeholder="Select gender">
              {genderOptions.map((gender) => (
                <Option key={gender.value} value={gender.value}>
                  {gender.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              {statusOptions.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {user ? "Update" : "Create"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
