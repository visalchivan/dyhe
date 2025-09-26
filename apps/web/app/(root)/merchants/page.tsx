"use client";
import React from "react";
import MerchantsTable from "./_components/merchants-table";
import { Button, Flex, Input, Select, Space } from "antd";

const { Search } = Input;
const MerchantsPage = () => {
  return (
    <div>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>Merchants</h2>
      </header>
      <Flex style={{ padding: 16 }} justify="space-between">
        <Space>
          <Search
            placeholder="input search text"
            onSearch={() => {}}
            style={{ width: 200 }}
          />
          <Select
            options={[{ label: "Package 1", value: "package1" }]}
            style={{ width: 200 }}
          />
        </Space>
        <Space>
          <Button>Import Merchant</Button>
          <Button type="primary">Create Merchant</Button>
        </Space>
      </Flex>
      <div style={{ padding: 16 }}>
        <MerchantsTable />
      </div>
    </div>
  );
};

export default MerchantsPage;
