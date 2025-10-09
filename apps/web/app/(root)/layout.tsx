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
  BarChartOutlined,
  SettingOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  Breadcrumb,
  Layout,
  Menu,
  theme,
  Dropdown,
  Avatar,
  Space,
  Typography,
} from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext";
import { useLogout } from "../../hooks/useAuth";
import { canView } from "../../lib/rbac";

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  resource?: string
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    resource, // Store resource name for permission checking
  } as MenuItem & { resource?: string };
}

// Define all menu items with their resource names
const allMenuItems = [
  getItem("Home", "/dashboard", <HomeOutlined />, undefined, "dashboard"),
  getItem("Packages", "/packages", <GiftOutlined />, undefined, "packages"),
  getItem(
    "Print Packages",
    "/packages/print",
    <PrinterOutlined />,
    undefined,
    "packages"
  ),
  getItem("Assign Packages", "/scan", <ScanOutlined />, undefined, "packages"),
  getItem("Merchants", "/merchants", <ShopOutlined />, undefined, "merchants"),
  getItem("Drivers", "/drivers", <CarOutlined />, undefined, "drivers"),
  getItem("Team", "/team", <TeamOutlined />, undefined, "team"),
  getItem("Reports", "/reports", <BarChartOutlined />, undefined, "reports"),
  getItem("Settings", "/settings", <SettingOutlined />, undefined, "settings"),
] as (MenuItem & { resource?: string })[];

// Filter menu items based on user role
function getFilteredMenuItems(userRole: string | undefined): MenuItem[] {
  return allMenuItems.filter((item) => {
    const menuItem = item as MenuItem & { resource?: string };
    if (!menuItem.resource) return true;
    return canView(userRole, menuItem.resource);
  });
}

// Breadcrumb mapping
const breadcrumbMap: Record<string, string[]> = {
  "/dashboard": ["Home"],
  "/packages": ["Home", "Packages"],
  "/packages/print": ["Home", "Print Packages"],
  "/scan": ["Home", "Assign Packages"],
  "/merchants": ["Home", "Merchants"],
  "/drivers": ["Home", "Drivers"],
  "/team": ["Home", "Team"],
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
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Get filtered menu items based on user role
  const menuItems = getFilteredMenuItems(user?.role);

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

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // User dropdown menu
  const userMenuItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

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
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div>
            <Text strong style={{ fontSize: "18px" }}>
              DYHE Platform
            </Text>
          </div>

          <Space>
            <Text type="secondary">Welcome, {user?.name || "User"}</Text>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Avatar
                style={{
                  backgroundColor: "#1890ff",
                  cursor: "pointer",
                }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </Space>
        </Header>
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
