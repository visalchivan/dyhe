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
  CreateMerchantDto,
  UpdateMerchantDto,
  Merchant,
} from "../../../../lib/api/merchants";

const { Option } = Select;

interface MerchantFormProps {
  merchant?: Merchant;
  onSubmit: (values: CreateMerchantDto | UpdateMerchantDto) => void;
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

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

export const MerchantForm: React.FC<MerchantFormProps> = ({
  merchant,
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (merchant) {
      form.setFieldsValue(merchant);
    } else {
      form.resetFields();
    }
  }, [merchant, form]);

  const handleSubmit = (values: CreateMerchantDto | UpdateMerchantDto) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: "ACTIVE",
        deliverFee: 0,
        latitude: 11.5564,
        longitude: 104.9282,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Merchant Name"
            rules={[
              { required: true, message: "Please enter merchant name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter merchant name" />
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
                type: "number",
                min: 0,
                message: "Delivery fee must be positive",
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

      <Form.Item
        name="address"
        label="Address"
        rules={[
          { required: true, message: "Please enter address" },
          { min: 10, message: "Address must be at least 10 characters" },
        ]}
      >
        <Input.TextArea rows={2} placeholder="Enter full address" />
      </Form.Item>

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
        rules={[{ type: "url", message: "Please enter a valid URL" }]}
      >
        <Input placeholder="Enter Google Maps URL" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="latitude"
            label="Latitude"
            rules={[
              { required: true, message: "Please enter latitude" },
              { type: "number", message: "Please enter a valid latitude" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter latitude"
              precision={6}
              step={0.000001}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="longitude"
            label="Longitude"
            rules={[
              { required: true, message: "Please enter longitude" },
              { type: "number", message: "Please enter a valid longitude" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter longitude"
              precision={6}
              step={0.000001}
            />
          </Form.Item>
        </Col>
      </Row>

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

      <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {merchant ? "Update" : "Create"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
