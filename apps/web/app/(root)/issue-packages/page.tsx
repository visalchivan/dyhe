"use client";

import { useEffect, useState } from "react";
import { Table, Typography, Tag, InputNumber, Modal, Input, Button, Space, message } from "antd";
import { packagesApi, Package } from "../../../lib/api/packages";

const { Title, Text } = Typography;

export default function IssuePackagesPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Package[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<Package | null>(null);
  const [editNote, setEditNote] = useState<string | null>(null);
  const [editExtraFee, setEditExtraFee] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await packagesApi.listIssuePackages({ page, limit, search });
      setData(res.packages);
      setTotal(res.pagination.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const openEdit = (pkg: Package) => {
    setEditTarget(pkg);
    setEditNote(pkg.issueNote ?? "");
    setEditExtraFee(Number(pkg.extraDeliveryFee || 0));
  };

  const handleSave = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await packagesApi.updatePackageIssue(editTarget.id, {
        hasIssue: true,
        issueNote: editNote ?? "",
        extraDeliveryFee: editExtraFee,
      });
      message.success("Issue updated successfully!");
      setEditTarget(null);
      await fetchData(); // Wait for refetch to complete
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to update issue");
      console.error("Error updating issue:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}>
        <Title level={3} style={{ margin: 0 }}>Issue Packages</Title>
        <Space>
          <Input.Search
            allowClear
            placeholder="Search package/customer"
            onSearch={(v) => { setSearch(v); setPage(1); fetchData(); }}
            style={{ width: 260 }}
          />
        </Space>
      </Space>

      <Table
        rowKey={(r) => r.id}
        loading={loading}
        dataSource={data}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          onChange: (p, ps) => { setPage(p); setLimit(ps); },
        }}
        columns={[
          { title: "Package #", dataIndex: "packageNumber" },
          { title: "Customer", dataIndex: "customerName", render: (v, r) => (
            <div>
              <div>{v}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>{r.customerPhone}</Text>
            </div>
          ) },
          { title: "Address", dataIndex: "customerAddress", ellipsis: true },
          { title: "Delivery Fee", dataIndex: "deliveryFee", render: (v) => `$${Number(v).toFixed(2)}` },
          { title: "Extra Fee", dataIndex: "extraDeliveryFee", render: (v) => `$${Number(v).toFixed(2)}` },
          { title: "Issue?", dataIndex: "hasIssue", render: (v) => v ? <Tag color="red">Issue</Tag> : <Tag>None</Tag> },
          { title: "Note", dataIndex: "issueNote", ellipsis: true },
          { title: "Actions", key: "actions", render: (_, r) => (
            <Space>
              <Button type="link" onClick={() => openEdit(r)}>Edit</Button>
            </Space>
          ) },
        ]}
      />

      <Modal
        open={!!editTarget}
        title={`Edit Issue - ${editTarget?.packageNumber}`}
        onCancel={() => setEditTarget(null)}
        onOk={handleSave}
        okText="Save"
        confirmLoading={saving}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Text strong>Extra Delivery Fee</Text>
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={0.25}
              value={editExtraFee}
              onChange={(v) => setEditExtraFee(Number(v || 0))}
              prefix="$"
            />
          </div>
          <div>
            <Text strong>Issue Note</Text>
            <Input.TextArea
              rows={4}
              value={editNote ?? ""}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Describe the issue and reason for extra fee"
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
}
