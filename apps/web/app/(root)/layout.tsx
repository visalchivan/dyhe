"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  HomeOutlined,
  GiftOutlined,
  ScanOutlined,
  ShopOutlined,
  CarOutlined,
  TeamOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import Image from "next/image";

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem("Home", "/", <HomeOutlined />),
  getItem("Packages", "/packages", <GiftOutlined />),
  getItem("Scan Package", "/scan", <ScanOutlined />),
  getItem("Merchants", "/merchants", <ShopOutlined />),
  getItem("Drivers", "/drivers", <CarOutlined />),
  getItem("Team", "/team", <TeamOutlined />),
  getItem("Customers", "/customers", <UserOutlined />),
  getItem("Reports", "/reports", <BarChartOutlined />),
  getItem("Settings", "/settings", <SettingOutlined />),
];

// Breadcrumb mapping
const breadcrumbMap: Record<string, string[]> = {
  "/": ["Home"],
  "/packages": ["Home", "Packages"],
  "/scan-package": ["Home", "Scan Package"],
  "/merchants": ["Home", "Merchants"],
  "/drivers": ["Home", "Drivers"],
  "/team": ["Home", "Team"],
  "/customers": ["Home", "Customers"],
  "/reports": ["Home", "Reports"],
  "/settings": ["Home", "Settings"],
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>("/");
  const [breadcrumbItems, setBreadcrumbItems] = useState<{ title: string }[]>([
    { title: "Home" },
  ]);

  const router = useRouter();
  const pathname = usePathname();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Update selected key and breadcrumb when pathname changes
  useEffect(() => {
    setSelectedKey(pathname);
    const breadcrumbs = breadcrumbMap[pathname] || ["Home"];
    setBreadcrumbItems(breadcrumbs.map((title) => ({ title })));
  }, [pathname]);

  // Handle menu item click
  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKey(key);
    router.push(key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={240}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div style={{ padding: 16 }}>
          <Image
            src="/logo-light.svg"
            alt="logo"
            width={40}
            height={40}
            style={{ width: 40, height: 40 }}
          />
        </div>
        <Menu
          theme="dark"
          selectedKeys={[selectedKey]}
          mode="inline"
          items={items}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "0" }}>
          <Breadcrumb style={{ margin: "16px 16px" }} items={breadcrumbItems} />

          {children}
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
