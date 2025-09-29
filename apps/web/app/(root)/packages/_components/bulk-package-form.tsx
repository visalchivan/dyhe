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

  const { data: merchantsData } = useMerchants({ limit: 100 });

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
          placeholder="Customer phone"
          onChange={(e) =>
            updatePackage(index, "customerPhone", e.target.value)
          }
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
                placeholder="Select merchant"
                showSearch
                optionFilterProp="children"
              >
                {merchantsData?.merchants.map((merchant) => (
                  <Option key={merchant.id} value={merchant.id}>
                    {merchant.name} ({merchant.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="status" style={{ display: "none" }}>
          <Input />
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
          <Button type="dashed" icon={<PlusOutlined />} onClick={addPackage}>
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
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create {packages.length} Packages
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
