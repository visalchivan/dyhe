"use client";

import React from "react";
import { Drawer, Typography } from "antd";
import { PackageForm } from "./package-form";
import {
  CreatePackageDto,
  UpdatePackageDto,
} from "../../../../lib/api/packages";
import { useCreatePackage } from "../../../../hooks/usePackages";

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

  const handleSubmit = async (values: CreatePackageDto) => {
    try {
      await createPackageMutation.mutateAsync(values);
      onClose();
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
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
          handleSubmit as (values: CreatePackageDto | UpdatePackageDto) => void
        }
        loading={createPackageMutation.isPending}
        onCancel={onClose}
      />
    </Drawer>
  );
};
