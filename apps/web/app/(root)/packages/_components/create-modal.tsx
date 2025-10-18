"use client";

import React, { useState } from "react";
import { Drawer, Typography, Modal } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { PackageForm } from "./package-form";
import {
  CreatePackageDto,
  UpdatePackageDto,
  Package,
} from "../../../../lib/api/packages";
import { useCreatePackage } from "../../../../hooks/usePackages";
import { printLabel } from "../../../../lib/utils/directPrint";

const { Title } = Typography;

interface CreatePackageModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreatePackageModal: React.FC<CreatePackageModalProps> = ({
  visible,
  onClose,
}) => {
  const createPackageMutation = useCreatePackage();
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [createdPackage, setCreatedPackage] = useState<Package | null>(null);

  const handleSubmit = async (values: CreatePackageDto) => {
    try {
      const result = await createPackageMutation.mutateAsync(values);

      // Store created package and show print option
      setCreatedPackage(result);
      setPrintModalVisible(true);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handlePrintNow = async () => {
    setPrintModalVisible(false);
    onClose();

    if (createdPackage) {
      try {
        // Print the label
        await printLabel({
          id: createdPackage.id,
          packageNumber: createdPackage.packageNumber,
          name: createdPackage.name,
          customerName: createdPackage.customerName,
          customerPhone: createdPackage.customerPhone,
          customerAddress: createdPackage.customerAddress,
          codAmount: createdPackage.codAmount,
          merchant: { name: createdPackage.merchant.name },
        });
      } catch (error) {
        console.error("Error printing label:", error);
      }
    }
  };

  const handleSkipPrint = () => {
    setPrintModalVisible(false);
    onClose();
    setCreatedPackage(null);
  };

  return (
    <>
      <Drawer
        title={
          <Title level={4} style={{ margin: 0 }}>
            Create New Package
          </Title>
        }
        placement="right"
        onClose={onClose}
        open={visible}
        width={600}
      >
        <PackageForm
          onSubmit={
            handleSubmit as (
              values: CreatePackageDto | UpdatePackageDto
            ) => void
          }
          loading={createPackageMutation.isPending}
          onCancel={onClose}
        />
      </Drawer>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PrinterOutlined style={{ fontSize: 20, color: "#1890ff" }} />
            <span>Print Package Label?</span>
          </div>
        }
        open={printModalVisible}
        onOk={handlePrintNow}
        onCancel={handleSkipPrint}
        okText="Print Now"
        cancelText="Skip"
        okButtonProps={{ icon: <PrinterOutlined /> }}
      >
        <p>
          Successfully created package{" "}
          <strong>{createdPackage?.packageNumber}</strong>!
        </p>
        <p>Would you like to print the label now?</p>
      </Modal>
    </>
  );
};
