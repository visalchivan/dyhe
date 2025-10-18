"use client";

import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Row,
  Col,
} from "antd";
import {
  CreateDriverDto,
  UpdateDriverDto,
  Driver,
} from "../../../../lib/api/drivers";

const { Option } = Select;

interface DriverFormProps {
  driver?: Driver;
  onSubmit: (values: CreateDriverDto | UpdateDriverDto) => void;
  loading?: boolean;
  onCancel: () => void;
}

const bankOptions = [
  { value: "ABA", label: "ABA Bank" },
  { value: "ACELEDA", label: "Acleda Bank" },
  { value: "WING", label: "Wing Bank" },
  { value: "CANADIA", label: "Canadia Bank" },
  { value: "SATHAPANA", label: "Sathapana Bank" },
];

const driverStatusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "ON_DUTY", label: "On Duty" },
  { value: "OFF_DUTY", label: "Off Duty" },
  { value: "SUSPENDED", label: "Suspended" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

export const DriverForm: React.FC<DriverFormProps> = ({
  driver,
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (driver) {
      // Convert numeric fields to numbers for proper validation
      form.setFieldsValue({
        ...driver,
        deliverFee: Number(driver.deliverFee || 0),
      });
    } else {
      form.resetFields();
    }
  }, [driver, form]);

  const handleSubmit = (values: CreateDriverDto | UpdateDriverDto) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: "ACTIVE",
        driverStatus: "ACTIVE",
        deliverFee: 0,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Driver Name"
            rules={[
              { required: true, message: "Please enter driver name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter driver name" />
          </Form.Item>
        </Col>
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
      </Row>

      <Row gutter={16}>
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
        <Col span={12}>
          <Form.Item
            name="deliverFee"
            label="Delivery Fee ($)"
            rules={[
              { required: true, message: "Please enter delivery fee" },
              {
                validator: (_, value) => {
                  if (value === null || value === undefined) {
                    return Promise.reject(
                      new Error("Please enter delivery fee")
                    );
                  }
                  const numValue = Number(value);
                  if (isNaN(numValue) || numValue < 0) {
                    return Promise.reject(
                      new Error("Delivery fee must be positive")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter delivery fee"
              precision={2}
              min={0}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Login Credentials */}
      <Row gutter={16}>
        <Col span={driver ? 24 : 12}>
          <Form.Item
            name="username"
            label="Username (for driver login)"
            rules={
              !driver
                ? [
                    { required: true, message: "Please enter username" },
                    {
                      min: 3,
                      message: "Username must be at least 3 characters",
                    },
                    {
                      max: 20,
                      message: "Username must be less than 20 characters",
                    },
                  ]
                : []
            }
          >
            <Input
              placeholder={
                driver ? "No username set" : "Enter username for driver login"
              }
              disabled={!!driver}
            />
          </Form.Item>
        </Col>
        {!driver && (
          <Col span={12}>
            <Form.Item
              name="password"
              label="Password (for driver login)"
              rules={[
                { required: true, message: "Please enter password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password placeholder="Enter password for driver login" />
            </Form.Item>
          </Col>
        )}
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="bank"
            label="Bank"
            rules={[{ required: true, message: "Please select bank" }]}
          >
            <Select placeholder="Select bank">
              {bankOptions.map((bank) => (
                <Option key={bank.value} value={bank.value}>
                  {bank.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="bankAccountNumber"
            label="Account Number"
            rules={[
              { required: true, message: "Please enter account number" },
              { min: 10, message: "Account number must be at least 10 digits" },
            ]}
          >
            <Input placeholder="Enter account number" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="bankAccountName"
            label="Account Name"
            rules={[
              { required: true, message: "Please enter account name" },
              { min: 2, message: "Account name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter account name" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="googleMapsUrl"
        label="Google Maps URL (Optional)"
        rules={[
          {
            validator: (_, value) => {
              if (!value || value.trim() === "") {
                return Promise.resolve();
              }
              if (/^https?:\/\/.+/.test(value)) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error(
                  "Please enter a valid URL starting with http:// or https://"
                )
              );
            },
          },
        ]}
      >
        <Input placeholder="Enter Google Maps URL (e.g., https://maps.google.com/...)" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="driverStatus"
            label="Driver Status"
            rules={[{ required: true, message: "Please select driver status" }]}
          >
            <Select placeholder="Select driver status">
              {driverStatusOptions.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="status"
            label="Account Status"
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
            {driver ? "Update" : "Create"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
