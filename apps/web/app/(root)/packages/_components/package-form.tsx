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
  CreatePackageDto,
  UpdatePackageDto,
  Package,
} from "../../../../lib/api/packages";
import { useMerchants } from "../../../../hooks/useMerchants";

const { Option } = Select;

interface PackageFormProps {
  packageData?: Package;
  onSubmit: (values: CreatePackageDto | UpdatePackageDto) => void;
  loading?: boolean;
  onCancel: () => void;
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending (In Central Warehouse)" },
  { value: "ON_DELIVERY", label: "On Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "FAILED", label: "Failed" },
  { value: "RETURNED", label: "Returned" },
];

export const PackageForm: React.FC<PackageFormProps> = ({
  packageData,
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const { data: merchantsData } = useMerchants({ limit: 100 });

  // Auto-fill delivery fee when merchant is selected
  const handleMerchantChange = (merchantId: string) => {
    const selectedMerchant = merchantsData?.merchants.find(
      (m) => m.id === merchantId
    );
    if (selectedMerchant) {
      form.setFieldValue("deliveryFee", Number(selectedMerchant.deliverFee));
    }
  };

  React.useEffect(() => {
    if (packageData) {
      // Convert numeric fields to numbers for proper validation
      form.setFieldsValue({
        ...packageData,
        codAmount: Number(packageData.codAmount),
        deliveryFee: Number(packageData.deliveryFee),
        merchantId: packageData.merchant?.id || packageData.merchantId,
      });
    } else {
      form.resetFields();
    }
  }, [packageData, form]);

  const handleSubmit = (values: CreatePackageDto | UpdatePackageDto) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: "PENDING",
        codAmount: 0,
        deliveryFee: 0,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="customerName"
            label="Customer Name"
            rules={[
              { required: true, message: "Please enter customer name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter customer name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="customerPhone"
            label="Phone Number"
            rules={[
              { required: true, message: "Please enter phone number" },
              {
                pattern: /^[0-9]+$/,
                message: "Phone number must contain only digits",
              },
            ]}
          >
            <Input placeholder="Enter phone number (digits only)" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              {STATUS_OPTIONS.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="customerAddress"
        label="Customer Address"
        rules={[
          { required: true, message: "Please enter customer address" },
          { min: 5, message: "Address must be at least 5 characters" },
        ]}
      >
        <Input.TextArea
          rows={3}
          placeholder="Enter detailed customer address"
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="codAmount"
            label="COD Amount ($)"
            rules={[
              { required: true, message: "Please enter COD amount" },
              {
                type: "number",
                min: 0,
                message: "COD amount must be positive",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter COD amount"
              precision={2}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="deliveryFee"
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

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="merchantId"
            label="Merchant"
            rules={[{ required: true, message: "Please select merchant" }]}
          >
            <Select
              placeholder="Select merchant"
              showSearch
              optionFilterProp="children"
              onChange={handleMerchantChange}
            >
              {merchantsData?.merchants.map((merchant) => (
                <Option key={merchant.id} value={merchant.id}>
                  {merchant.name} - {merchant.phone}
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
            {packageData ? "Update" : "Create"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
