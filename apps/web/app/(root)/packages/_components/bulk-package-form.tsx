"use client";

import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Row,
  Col,
  Card,
  Typography,
  Divider,
  Table,
  notification,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  BulkCreatePackagesDto,
  PackageDataDto,
} from "../../../../lib/api/packages";
import { useMerchants } from "../../../../hooks/useMerchants";

const { Option } = Select;
const { Title } = Typography;

interface BulkPackageFormProps {
  onSubmit: (values: BulkCreatePackagesDto) => void;
  loading?: boolean;
  onCancel: () => void;
}

export const BulkPackageForm: React.FC<BulkPackageFormProps> = ({
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [packages, setPackages] = useState<PackageDataDto[]>([
    {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      codAmount: 0, // Optional
      deliveryFee: 0, // Optional
    },
  ]);
  const [rowCount, setRowCount] = useState<number>(1);

  const { data: merchantsData } = useMerchants({ limit: 100 });

  // Auto-fill delivery fee when merchant is selected
  const handleMerchantChange = (merchantId: string) => {
    const selectedMerchant = merchantsData?.merchants.find(
      (m) => m.id === merchantId
    );
    if (selectedMerchant) {
      const deliveryFee = Number(selectedMerchant.deliverFee);
      // Update all packages with merchant's delivery fee
      setPackages(packages.map((pkg) => ({ ...pkg, deliveryFee })));
    }
  };

  const addPackage = () => {
    setPackages([
      ...packages,
      {
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        codAmount: 0, // Optional
        deliveryFee: 0, // Optional
      },
    ]);
  };

  const removePackage = (index: number) => {
    if (packages.length > 1) {
      setPackages(packages.filter((_, i) => i !== index));
    }
  };

  const generateRows = () => {
    if (rowCount < 1 || rowCount > 500) {
      notification.warning({
        message: "Invalid Number",
        description: "Please enter a number between 1 and 500.",
      });
      return;
    }

    const newPackages = Array.from({ length: rowCount }, () => ({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      codAmount: 0,
      deliveryFee: 0,
    }));

    setPackages(newPackages);
    notification.success({
      message: "Rows Generated",
      description: `Successfully generated ${rowCount} empty rows.`,
    });
  };

  const updatePackage = (
    index: number,
    field: keyof PackageDataDto,
    value: string | number
  ) => {
    const updatedPackages = packages.map((pkg, i) =>
      i === index ? { ...pkg, [field]: value } : pkg
    );
    setPackages(updatedPackages);
  };

  const handleSubmit = (values: { merchantId: string; status: string }) => {
    // Filter out packages with empty required fields (only customer details required)
    const validPackages = packages.filter(
      (pkg) =>
        pkg.customerName.trim() !== "" &&
        pkg.customerPhone.trim() !== "" &&
        pkg.customerAddress.trim() !== ""
    );

    if (validPackages.length === 0) {
      notification.error({
        message: "No Valid Packages",
        description:
          "Please fill in all required fields for at least one package.",
      });
      return;
    }

    const bulkData: BulkCreatePackagesDto = {
      merchantId: values.merchantId,
      status: values.status,
      packages: validPackages,
    };

    console.log(
      "Frontend sending bulk data:",
      JSON.stringify(bulkData, null, 2)
    );
    onSubmit(bulkData);
  };

  const packageColumns = [
    {
      title: "Customer Name *",
      dataIndex: "customerName",
      key: "customerName",
      render: (value: string, record: PackageDataDto, index: number) => (
        <Input
          value={value}
          size="large"
          placeholder="Customer name"
          onChange={(e) => updatePackage(index, "customerName", e.target.value)}
        />
      ),
    },
    {
      title: "Customer Phone *",
      dataIndex: "customerPhone",
      key: "customerPhone",
      render: (value: string, record: PackageDataDto, index: number) => (
        <Input
          value={value}
          size="large"
          placeholder="Customer phone (digits only)"
          onChange={(e) => {
            const numericValue = e.target.value.replace(/[^0-9]/g, "");
            updatePackage(index, "customerPhone", numericValue);
          }}
        />
      ),
    },
    {
      title: "Customer Address *",
      dataIndex: "customerAddress",
      key: "customerAddress",
      render: (value: string, record: PackageDataDto, index: number) => (
        <Input
          value={value}
          size="large"
          placeholder="Customer address"
          onChange={(e) =>
            updatePackage(index, "customerAddress", e.target.value)
          }
        />
      ),
    },
    {
      title: "COD Amount (Optional)",
      dataIndex: "codAmount",
      key: "codAmount",
      render: (value: number, record: PackageDataDto, index: number) => (
        <InputNumber
          value={value}
          size="large"
          placeholder="COD amount (optional)"
          precision={2}
          min={0}
          style={{ width: "100%" }}
          onChange={(val) => updatePackage(index, "codAmount", val || 0)}
        />
      ),
    },
    {
      title: "Delivery Fee (Optional)",
      dataIndex: "deliveryFee",
      key: "deliveryFee",
      render: (value: number, record: PackageDataDto, index: number) => (
        <InputNumber
          value={value}
          size="large"
          placeholder="Delivery fee (optional)"
          precision={2}
          min={0}
          style={{ width: "100%" }}
          onChange={(val) => updatePackage(index, "deliveryFee", val || 0)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: PackageDataDto, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removePackage(index)}
          disabled={packages.length === 1}
        />
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: "READY",
      }}
    >
      <Card style={{ marginBottom: 16, background: "#f6f8fa" }}>
        <Title level={5}>Quick Generate Rows</Title>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Space.Compact style={{ width: "100%" }}>
              <InputNumber
                size="large"
                placeholder="How many packages?"
                min={1}
                max={500}
                value={rowCount}
                onChange={(val) => setRowCount(val || 1)}
                style={{ width: "100%" }}
              />
              <Button
                type="primary"
                size="large"
                onClick={generateRows}
                disabled={loading}
              >
                Generate Rows
              </Button>
            </Space.Compact>
          </Col>
          <Col span={12}>
            <Typography.Text type="secondary">
              Enter a number (1-500) to generate empty rows quickly
            </Typography.Text>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Title level={4}>Package Settings</Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="merchantId"
              label="Merchant"
              rules={[{ required: true, message: "Please select merchant" }]}
            >
              <Select
                size="large"
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

        <Form.Item name="status" style={{ display: "none" }}>
          <Input size="large" />
        </Form.Item>
      </Card>

      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Package Details ({packages.length} packages)
          </Title>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addPackage}
            size="large"
          >
            Add Package
          </Button>
        </div>

        <Table
          columns={packageColumns}
          dataSource={packages.map((pkg, index) => ({ ...pkg, key: index }))}
          pagination={false}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>

      <Divider />

      <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel} size="large">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
          >
            Create {packages.length} Packages
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
