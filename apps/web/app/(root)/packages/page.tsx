"use client";
import {
  Button,
  Divider,
  Drawer,
  DrawerProps,
  Flex,
  Input,
  Select,
  Space,
} from "antd";
import Link from "next/link";
import React, { useState } from "react";
import PackagesTable from "./_components/packages-table";
const { Search } = Input;

const PackagesPage = () => {
  const onSearch = (value: string) => {
    console.log(value);
  };

  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<DrawerProps["size"]>();

  const showDefaultDrawer = () => {
    setSize("default");
    setOpen(true);
  };

  const showLargeDrawer = () => {
    setSize("large");
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>Packages</h2>
      </header>
      <Flex style={{ padding: 16 }} justify="space-between">
        <Space>
          <Search
            placeholder="input search text"
            onSearch={onSearch}
            style={{ width: 200 }}
          />
          <Select
            options={[{ label: "Package 1", value: "package1" }]}
            style={{ width: 200 }}
          />
        </Space>
        <Space>
          <Button onClick={showDefaultDrawer}>Import Package</Button>
          <Button type="primary" onClick={showLargeDrawer}>
            Create Package
          </Button>
        </Space>
      </Flex>
      <div style={{ padding: 16 }}>
        <PackagesTable />
      </div>
      <Drawer
        title={`${size} Drawer`}
        placement="right"
        size={size}
        onClose={onClose}
        open={open}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={onClose}>
              OK
            </Button>
          </Space>
        }
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </div>
  );
};

export default PackagesPage;
