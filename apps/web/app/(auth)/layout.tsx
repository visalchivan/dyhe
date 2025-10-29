import React from "react";
import Image from "next/image";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        height: "100dvh",
        width: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <main style={{ width: "100%", height: "100%" }}>{children}</main>
      <div
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <Image
          src="https://i.pinimg.com/1200x/b1/7d/b4/b17db4346f9813dd4b99c3d82fda56f9.jpg"
          alt="logo"
          width={1000}
          height={1000}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
};

export default AuthLayout;
