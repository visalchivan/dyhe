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
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  BulkCreatePackagesDto,
  PackageDataDto,
} from "../../../../lib/api/packages";
import { useMerchants } from "../../../../hooks/useMerchants";
import { useDrivers } from "../../../../hooks/useDrivers";

const { Option } = Select;
const { Title, Text } = Typography;

interface BulkPackageFormProps {
  onSubmit: (values: BulkCreatePackagesDto) => void;
  loading?: boolean;
  onCancel: () => void;
}

const statusOptions = [
  { value: "RECEIVED", label: "Received" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "DELIVERING", label: "Delivering" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RETURNED", label: "Returned" },
];

export const BulkPackageForm: React.FC<BulkPackageFormProps> = ({
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [packages, setPackages] = useState<PackageDataDto[]>([
    {
      name: "",
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      codAmount: 0,
      deliveryFee: 0,
    },
  ]);

  const { data: merchantsData } = useMerchants({ limit: 100 });
  const { data: driversData } = useDrivers({ limit: 100 });

  const addPackage = () => {
    setPackages([
      ...packages,
      {
        name: "",
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        codAmount: 0,
        deliveryFee: 0,
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
    value: any
  ) => {
    const updatedPackages = packages.map((pkg, i) =>
      i === index ? { ...pkg, [field]: value } : pkg
    );
    setPackages(updatedPackages);
  };

  const handleSubmit = (values: any) => {
    const bulkData: BulkCreatePackagesDto = {
      merchantId: values.merchantId,
      driverId: values.driverId,
      status: values.status,
      packages: packages,
    };
    onSubmit(bulkData);
  };

  const packageColumns = [
    {
      title: "Customer Name",
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
      title: "Customer Phone",
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
      title: "Customer Address",
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
      title: "COD Amount",
      dataIndex: "codAmount",
      key: "codAmount",
      render: (value: number, record: PackageDataDto, index: number) => (
        <InputNumber
          value={value}
          placeholder="COD amount"
          precision={2}
          min={0}
          style={{ width: "100%" }}
          onChange={(val) => updatePackage(index, "codAmount", val || 0)}
        />
      ),
    },
    {
      title: "Delivery Fee",
      dataIndex: "deliveryFee",
      key: "deliveryFee",
      render: (value: number, record: PackageDataDto, index: number) => (
        <InputNumber
          value={value}
          placeholder="Delivery fee"
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
      render: (_: any, record: PackageDataDto, index: number) => (
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
        status: "RECEIVED",
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
          <Col span={12}>
            <Form.Item name="driverId" label="Driver (Optional)">
              <Select
                placeholder="Select driver"
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {driversData?.drivers.map((driver) => (
                  <Option key={driver.id} value={driver.id}>
                    {driver.name} ({driver.email})
                  </Option>
                ))}
              </Select>
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
