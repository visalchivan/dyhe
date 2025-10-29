"use client";

import React, { useState } from "react";
import { Drawer, Typography, Modal } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { BulkPackageForm } from "./bulk-package-form";
import { BulkCreatePackagesDto, Package } from "../../../../lib/api/packages";
import { useBulkCreatePackages } from "../../../../hooks/usePackages";
import { printBulkLabels } from "../../../../lib/utils/directPrint";

const { Title } = Typography;

interface BulkCreatePackageModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BulkCreatePackageModal: React.FC<BulkCreatePackageModalProps> = ({
  visible,
  onClose,
}) => {
  const bulkCreatePackagesMutation = useBulkCreatePackages();
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [createdPackages, setCreatedPackages] = useState<Package[]>([]);

  const handleSubmit = async (values: BulkCreatePackagesDto) => {
    try {
      const result = await bulkCreatePackagesMutation.mutateAsync(values);

      // Store created packages and show print option
      setCreatedPackages(result.packages);
      setPrintModalVisible(true);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handlePrintNow = async () => {
    setPrintModalVisible(false);
    onClose();

    try {
      // Print the labels
      await printBulkLabels(
        createdPackages.map((pkg) => ({
          id: pkg.id,
          packageNumber: pkg.packageNumber,
          name: pkg.name,
          customerName: pkg.customerName,
          customerPhone: pkg.customerPhone,
          customerAddress: pkg.customerAddress,
          codAmount: pkg.codAmount,
          merchant: { name: pkg.merchant.name },
        }))
      );
    } catch (error) {
      console.error("Error printing labels:", error);
    }
  };

  const handleSkipPrint = () => {
    setPrintModalVisible(false);
    onClose();
    setCreatedPackages([]);
  };

  return (
    <>
      <Drawer
        title={
          <Title level={4} style={{ margin: 0 }}>
            Bulk Create Packages
          </Title>
        }
        placement="right"
        onClose={onClose}
        open={visible}
        width={1000}
      >
        <BulkPackageForm
          onSubmit={handleSubmit}
          loading={bulkCreatePackagesMutation.isPending}
          onCancel={onClose}
        />
      </Drawer>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PrinterOutlined style={{ fontSize: 20, color: "#1890ff" }} />
            <span>Print Package Labels?</span>
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
          Successfully created{" "}
          <strong>{createdPackages.length} packages</strong>!
        </p>
        <p>Would you like to print the labels now?</p>
      </Modal>
    </>
  );
};
