"use client";

import React from "react";
import { Drawer, Typography } from "antd";
import { BulkPackageForm } from "./bulk-package-form";
import { BulkCreatePackagesDto } from "../../../../lib/api/packages";
import { useBulkCreatePackages } from "../../../../hooks/usePackages";

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

  const handleSubmit = async (values: BulkCreatePackagesDto) => {
    try {
      await bulkCreatePackagesMutation.mutateAsync(values);
      onClose();
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
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
  );
};
