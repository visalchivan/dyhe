"use client";

import React from "react";
import { Drawer, Typography } from "antd";
import { PackageForm } from "./package-form";
import { Package, UpdatePackageDto } from "../../../../lib/api/packages";
import { useUpdatePackage } from "../../../../hooks/usePackages";

const { Title } = Typography;

interface EditPackageModalProps {
  packageData: Package | null;
  visible: boolean;
  onClose: () => void;
}

export const EditPackageModal: React.FC<EditPackageModalProps> = ({
  packageData,
  visible,
  onClose,
}) => {
  const updatePackageMutation = useUpdatePackage();

  const handleSubmit = async (values: UpdatePackageDto) => {
    if (!packageData) return;

    try {
      await updatePackageMutation.mutateAsync({
        id: packageData.id,
        data: values,
      });
      onClose();
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <Drawer
      title={
        <Title level={4} style={{ margin: 0 }}>
          Edit Package
        </Title>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={600}
    >
      <PackageForm
        packageData={packageData ?? undefined}
        onSubmit={handleSubmit}
        loading={updatePackageMutation.isPending}
        onCancel={onClose}
      />
    </Drawer>
  );
};
