import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./globals-mobile.css";
import "@ant-design/v5-patch-for-react-19";
import AntdProvider from "./antd-provider";
import { AuthProvider } from "../contexts/AuthContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "DYHE Delivery - Driver Portal",
  description:
    "Manage your deliveries on the go with DYHE Delivery Driver Portal",
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: "#1890ff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DYHE Driver",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <AntdProvider>{children}</AntdProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
