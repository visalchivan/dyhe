"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Middleware handles redirect, but add client-side fallback
    router.push("/sign-in");
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Spin size="large" />
    </div>
  );
};

export default HomePage;
