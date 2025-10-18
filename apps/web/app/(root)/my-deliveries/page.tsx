"use client";

import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Select,
  Typography,
  Modal,
  Form,
  Descriptions,
  message,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  useDriverPackages,
  useDriverPackage,
  useUpdatePackageStatus,
} from "../../../hooks/useDriverPackages";
import type { DriverPackage } from "../../../lib/api/driver";

const { Title } = Typography;
const { Option } = Select;

const statusColors: Record<string, string> = {
  RECEIVED: "blue",
  PREPARING: "cyan",
  READY: "green",
  DELIVERING: "orange",
  DELIVERED: "success",
  CANCELLED: "error",
  RETURNED: "warning",
};

export default function MyDeliveriesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null
  );

  const { data, isLoading } = useDriverPackages({
    page,
    limit,
    status: statusFilter,
  });

  const { data: selectedPackage } = useDriverPackage(selectedPackageId || "");
  const updateStatusMutation = useUpdatePackageStatus();

  const [form] = Form.useForm();

  const handleView = (record: DriverPackage) => {
    setSelectedPackageId(record.id);
    setViewModalVisible(true);
  };

  const handleUpdateStatus = (record: DriverPackage) => {
    setSelectedPackageId(record.id);
    form.setFieldsValue({ status: record.status });
    setUpdateModalVisible(true);
  };

  const handleStatusUpdate = async (values: { status: string }) => {
    if (!selectedPackageId) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: selectedPackageId,
        data: { status: values.status },
      });
      setUpdateModalVisible(false);
      form.resetFields();
      setSelectedPackageId(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleViewOnMap = (googleMapsUrl: string | null) => {
    if (googleMapsUrl) {
      window.open(googleMapsUrl, "_blank");
    } else {
      message.warning("No map location available");
    }
  };

  // Desktop columns
  const desktopColumns: ColumnsType<DriverPackage> = [
    {
      title: "Package #",
      dataIndex: "packageNumber",
      key: "packageNumber",
      fixed: "left",
      width: 150,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Customer",
      key: "customer",
      width: 200,
      render: (_, record) => (
        <div>
          <div>{record.customerName}</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            <PhoneOutlined /> {record.customerPhone}
          </div>
        </div>
      ),
    },
    {
      title: "Address",
      dataIndex: "customerAddress",
      key: "customerAddress",
      width: 250,
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          {record.customerGoogleMapsUrl && (
            <Button
              type="link"
              size="small"
              icon={<EnvironmentOutlined />}
              onClick={() => handleViewOnMap(record.customerGoogleMapsUrl)}
              style={{ padding: 0 }}
            >
              View on Map
            </Button>
          )}
        </div>
      ),
    },
    {
      title: "Merchant",
      key: "merchant",
      width: 150,
      render: (_, record) => record.merchant.name,
    },
    {
      title: "COD Amount",
      dataIndex: "codAmount",
      key: "codAmount",
      width: 120,
      render: (amount) => `$${Number(amount).toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={statusColors[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => handleUpdateStatus(record)}
          >
            Update
          </Button>
        </Space>
      ),
    },
  ];

  // Mobile columns - simplified for small screens
  const mobileColumns: ColumnsType<DriverPackage> = [
    {
      title: "Delivery Info",
      key: "info",
      render: (_, record) => (
        <div style={{ padding: "8px 0" }}>
          {/* Package Number */}
          <div style={{ marginBottom: 8 }}>
            <Tag color="blue" style={{ fontSize: 12, fontWeight: "bold" }}>
              {record.packageNumber}
            </Tag>
            <Tag color={statusColors[record.status] || "default"}>
              {record.status}
            </Tag>
          </div>

          {/* Customer Info */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: "bold", fontSize: 14 }}>
              {record.customerName}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              <PhoneOutlined /> {record.customerPhone}
            </div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              📍 {record.customerAddress}
            </div>
          </div>

          {/* COD Amount */}
          <div style={{ marginBottom: 8 }}>
            <span
              style={{ fontWeight: "bold", color: "#52c41a", fontSize: 16 }}
            >
              COD: ${Number(record.codAmount).toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <Space wrap style={{ marginTop: 8 }}>
            {record.customerGoogleMapsUrl && (
              <Button
                type="primary"
                icon={<EnvironmentOutlined />}
                onClick={() => handleViewOnMap(record.customerGoogleMapsUrl)}
                size="small"
              >
                Navigate
              </Button>
            )}
            <Button
              type="default"
              icon={<PhoneOutlined />}
              onClick={() => window.open(`tel:${record.customerPhone}`)}
              size="small"
            >
              Call
            </Button>
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              size="small"
            >
              Details
            </Button>
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => handleUpdateStatus(record)}
              size="small"
            >
              Update
            </Button>
          </Space>
        </div>
      ),
    },
  ];

  // Detect screen size
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const columns = isMobile ? mobileColumns : desktopColumns;

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>
      <Card>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            marginBottom: 24,
            gap: isMobile ? 16 : 0,
          }}
        >
          <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
            📦 My Deliveries
          </Title>
          <Select
            placeholder="Filter by status"
            style={{ width: isMobile ? "100%" : 200 }}
            allowClear
            onChange={setStatusFilter}
            size={isMobile ? "large" : "middle"}
          >
            <Option value="READY">🟢 Ready</Option>
            <Option value="DELIVERING">🚚 Delivering</Option>
            <Option value="DELIVERED">✅ Delivered</Option>
            <Option value="RETURNED">🔄 Returned</Option>
            <Option value="CANCELLED">❌ Cancelled</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={data?.packages}
          rowKey="id"
          loading={isLoading}
          scroll={isMobile ? {} : { x: 1200 }}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.pagination.total,
            onChange: setPage,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} packages`,
            simple: isMobile,
            size: isMobile ? "small" : "default",
          }}
          size={isMobile ? "small" : "middle"}
        />
      </Card>

      {/* View Modal */}
      <Modal
        title="Package Details"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedPackageId(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setViewModalVisible(false);
              setSelectedPackageId(null);
            }}
          >
            Close
          </Button>,
          selectedPackage?.customerGoogleMapsUrl && (
            <Button
              key="map"
              type="primary"
              icon={<EnvironmentOutlined />}
              onClick={() =>
                handleViewOnMap(selectedPackage.customerGoogleMapsUrl)
              }
            >
              View on Map
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedPackage && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Package #" span={2}>
              <strong>{selectedPackage.packageNumber}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Status" span={2}>
              <Tag color={statusColors[selectedPackage.status] || "default"}>
                {selectedPackage.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Customer Name" span={2}>
              {selectedPackage.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="Customer Phone">
              <PhoneOutlined /> {selectedPackage.customerPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Customer Address" span={2}>
              {selectedPackage.customerAddress}
            </Descriptions.Item>
            <Descriptions.Item label="Merchant">
              {selectedPackage.merchant.name}
            </Descriptions.Item>
            <Descriptions.Item label="Merchant Phone">
              <PhoneOutlined /> {selectedPackage.merchant.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Merchant Address" span={2}>
              {selectedPackage.merchant.address}
            </Descriptions.Item>
            <Descriptions.Item label="COD Amount">
              ${Number(selectedPackage.codAmount).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Delivery Fee">
              ${Number(selectedPackage.deliveryFee).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Package Name" span={2}>
              {selectedPackage.name}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Update Package Status"
        open={updateModalVisible}
        onCancel={() => {
          setUpdateModalVisible(false);
          setSelectedPackageId(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={updateStatusMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleStatusUpdate}>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select size="large">
              <Option value="READY">Ready to Deliver</Option>
              <Option value="DELIVERING">Delivering</Option>
              <Option value="DELIVERED">Delivered</Option>
              <Option value="RETURNED">Returned</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
