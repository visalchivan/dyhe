"use client";

import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  Row,
  Col,
  DatePicker,
  Select,
  Table,
  Tag,
  message,
  Tabs,
  Statistic,
} from "antd";
import {
  FileExcelOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  ShopOutlined,
  TruckOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { useDrivers } from "../../../hooks/useDrivers";
import { useMerchants } from "../../../hooks/useMerchants";
import {
  useReports,
  useDriverReports,
  useMerchantReports,
} from "../../../hooks/useReports";
import { reportsApi, ReportsQuery } from "../../../lib/api/reports";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportsPage = () => {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<string[] | null>(null);
  // Do not apply a default filter; only show defaults in the picker UI
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [activeTab, setActiveTab] = useState<string>("drivers");

  // Prepare query parameters
  const reportsQuery = {
    driverId: selectedDriver || undefined,
    merchantId: selectedMerchant || undefined,
    startDate:
      dateRange && dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
    endDate:
      dateRange && dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
    page: 1,
    limit: 1000,
    type:
      activeTab === "drivers"
        ? "driver"
        : activeTab === "merchants"
          ? "merchant"
          : "package",
  };

  // Fetch data using the new reports API
  const {
    data: reportsData,
    isLoading: reportsLoading,
    refetch: refetchReports,
  } = useReports(reportsQuery as ReportsQuery);
  const { data: driverReportsData, isLoading: driverReportsLoading } =
    useDriverReports(reportsQuery as ReportsQuery);
  const { data: merchantReportsData, isLoading: merchantReportsLoading } =
    useMerchantReports(reportsQuery as ReportsQuery);

  const { data: driversData } = useDrivers({ limit: 100 });
  const { data: merchantsData } = useMerchants({ limit: 100 });

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "drivers":
        return driverReportsData;
      case "merchants":
        return merchantReportsData;
      default:
        return reportsData;
    }
  };

  const currentData = getCurrentData();
  const currentLoading =
    reportsLoading || driverReportsLoading || merchantReportsLoading;

  // Get statistics from the API response
  const analytics = currentData?.analytics;
  const totalPackages = analytics?.totalPackages || 0;
  const totalCOD = analytics?.totalCOD || 0;
  const deliveredPackages = analytics?.deliveredPackages || 0;
  const pendingPackages = analytics?.pendingPackages || 0;

  // Export: one XLSX per merchant (using date range or default to current date)
  const [exporting, setExporting] = useState(false);
  const exportExcelSmart = async () => {
    try {
      setExporting(true);
      // If no date range selected, use current date as endDate (startDate will be undefined = all past data)
      const endDate = dateRange && dateRange[1] 
        ? dateRange[1].format("YYYY-MM-DD") 
        : dayjs().format("YYYY-MM-DD");
      const startDate = dateRange && dateRange[0] 
        ? dateRange[0].format("YYYY-MM-DD") 
        : undefined;
      
      const merchants: Array<{ id: string; name: string }> = merchantsData?.merchants || [];
      const targetMerchants = (!selectedMerchant || selectedMerchant.length === 0)
        ? merchants
        : merchants.filter((m) => selectedMerchant!.includes(m.id));
      if (!targetMerchants.length) {
        message.warning("No merchants to export");
        return;
      }
      for (const m of targetMerchants) {
        const blob = await reportsApi.exportMerchantExcel(m.id, startDate, endDate);
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        const filename = `DYHE_Report_${m.name.replace(/\s+/g, '_')}_${endDate}.xlsx`;
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await new Promise((r) => setTimeout(r, 250));
      }
      if (targetMerchants.length === merchants.length) {
        message.success(`Started downloads for all ${merchants.length} merchants`);
      } else {
        message.success(`Started downloads for ${targetMerchants.length} selected merchants`);
      }
    } catch (e) {
      console.error(e);
      message.error("Failed to export merchant reports");
    } finally {
      setExporting(false);
    }
  };

  // Table columns for driver reports
  const driverReportColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Shipment Create Date",
      dataIndex: "shipmentCreateDate",
      key: "shipmentCreateDate",
      width: 150,
      render: (date: string) => dayjs(date).format("YY-MM-DD hh:mm A"),
    },
    {
      title: "Shipment Delivery Date",
      dataIndex: "shipmentDeliveryDate",
      key: "shipmentDeliveryDate",
      width: 150,
      render: (date: string) =>
        date ? dayjs(date).format("YY-MM-DD hh:mm A") : "",
    },
    {
      title: "Receiver Name",
      dataIndex: "receiverName",
      key: "receiverName",
      width: 120,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      width: 120,
    },
    {
      title: "Tracking#",
      dataIndex: "trackingNumber",
      key: "trackingNumber",
      width: 200,
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: "Cash Collection Amount",
      dataIndex: "cashCollectionAmount",
      key: "cashCollectionAmount",
      width: 150,
      render: (amount: number) => (amount > 0 ? `$${amount.toFixed(2)}` : ""),
    },
    {
      title: "Driver",
      dataIndex: "driverName",
      key: "driverName",
      width: 120,
      render: (driverName: string) =>
        driverName ? (
          <Tag color="blue">{driverName}</Tag>
        ) : (
          <Tag color="default">Not Assigned</Tag>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const colorMap: { [key: string]: string } = {
          DELIVERED: "green",
          DELIVERING: "blue",
          PREPARING: "orange",
          READY: "cyan",
          RECEIVED: "default",
          CANCELLED: "red",
          RETURNED: "purple",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: '4px 22px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Reports
        </Title>
        <Text type="secondary">
          Generate comprehensive reports for drivers, merchants, and packages
          with Excel export
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Packages"
              value={totalPackages}
              prefix={<QrcodeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total COD Amount"
              value={totalCOD}
              prefix="$"
              precision={2}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Delivered"
              value={deliveredPackages}
              prefix={<TruckOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending"
              value={pendingPackages}
              prefix={<SearchOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Controls */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Text strong>Driver:</Text>
            <Select
              size="large"
              placeholder="Select Driver"
              value={selectedDriver}
              onChange={setSelectedDriver}
              style={{ width: "100%", marginTop: 4 }}
              allowClear
            >
              {driversData?.drivers.map(
                (driver: { id: string; name: string }) => (
                  <Option key={driver.id} value={driver.id}>
                    {driver.name}
                  </Option>
                )
              )}
            </Select>
          </Col>
          <Col span={6}>
            <Text strong>Merchant:</Text>
            <Select
              mode="multiple"
              size="large"
              placeholder="Select Merchant(s)"
              value={selectedMerchant}
              onChange={setSelectedMerchant}
              style={{ width: "100%", marginTop: 4 }}
              allowClear
            >
              {merchantsData?.merchants.map((merchant: { id: string; name: string }) => (
                <Option key={merchant.id} value={merchant.id}>
                  {merchant.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Text strong>Date Range:</Text>
            <RangePicker
              size="large"
              style={{ width: "100%", marginTop: 4 }}
              value={dateRange}
              onChange={setDateRange}
              // Show default selection in the calendar without applying it
              defaultPickerValue={[dayjs().startOf("month"), dayjs()]}
              presets={[
                { label: "Today", value: [dayjs(), dayjs()] },
                { label: "This Month", value: [dayjs().startOf("month"), dayjs()] },
                { label: "Last 7 Days", value: [dayjs().subtract(6, "day"), dayjs()] },
              ]}
            />
          </Col>
          <Col span={6}>
            <Space style={{ marginTop: 20 }}>
              <Button
                type="primary"
                size="large"
                icon={<FileExcelOutlined />}
                onClick={exportExcelSmart}
                loading={exporting}
              >
                {selectedMerchant && selectedMerchant.length > 0
                  ? `Export (Selected: ${selectedMerchant.length})`
                  : `Export (All: ${merchantsData?.merchants?.length || 0})`}
              </Button>
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={() => refetchReports()}
                loading={currentLoading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Simple Totals Bar */}
      <Card style={{ marginBottom: 16 }}>
        <Space size={24}>
          <Text strong>Total Package:</Text>
          <Text>{totalPackages}</Text>
          <Text strong>Total Amount:</Text>
          <Text>${Number(totalCOD).toFixed(2)}</Text>
        </Space>
      </Card>

      {/* Reports Tabs */}
      <Card>
        <Tabs
          size="large"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "drivers",
              label: (
                <>
                  Driver Reports
                </>
              ),
              children: (
                <Table
                  size="large"
                  columns={driverReportColumns}
                  dataSource={currentData?.data || []}
                  loading={currentLoading}
                  rowKey="id"
                  scroll={{ x: 1200 }}
                  pagination={{
                    pageSize: 50,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} packages`,
                  }}
                />
              ),
            },
            {
              key: "merchants",
              label: (
                <>
                  Merchant Reports
                </>
              ),
              children: (
                <Table
                  size="large"
                  columns={driverReportColumns}
                  dataSource={currentData?.data || []}
                  loading={currentLoading}
                  rowKey="id"
                  scroll={{ x: 1200 }}
                  pagination={{
                    pageSize: 50,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} packages`,
                  }}
                />
              ),
            },
            {
              key: "packages",
              label: (
                <>
                  Package Analytics
                </>
              ),
              children: (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <QrcodeOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                  <Title level={4} style={{ marginTop: 16 }}>
                    Package Analytics
                  </Title>
                  <Text type="secondary">
                    Advanced package analytics and insights coming soon...
                  </Text>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ReportsPage;
