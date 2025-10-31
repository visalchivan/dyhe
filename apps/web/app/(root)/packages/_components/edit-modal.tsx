"use client";

import React from "react";
import { Drawer, Typography, message } from "antd";
import { PackageForm } from "./package-form";
import { Package, UpdatePackageDto, packagesApi } from "../../../../lib/api/packages";
import { useUpdatePackage } from "../../../../hooks/usePackages";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const handleSubmit = async (values: UpdatePackageDto & { hasIssue?: boolean; issueNote?: string; extraDeliveryFee?: number; }) => {
    if (!packageData) return;

    try {
      const { hasIssue, issueNote, extraDeliveryFee, ...rest } = values as any;

      // 1) Update the standard package fields
      await updatePackageMutation.mutateAsync({ id: packageData.id, data: rest });

      // 2) Update issue fields only when toggled on or existing issue fields should change
      const existingHasIssue = Boolean(packageData.hasIssue);
      const existingNote = packageData.issueNote ?? "";
      const existingExtra = Number(packageData.extraDeliveryFee || 0);
      const nextHasIssue = Boolean(hasIssue);
      const nextNote = issueNote ?? existingNote;
      const nextExtra = Number((extraDeliveryFee ?? existingExtra) || 0);

      const shouldUpdateIssue =
        nextHasIssue ||
        existingHasIssue !== nextHasIssue ||
        existingNote !== nextNote ||
        existingExtra !== nextExtra;

      if (shouldUpdateIssue) {
        await packagesApi.updatePackageIssue(packageData.id, {
          hasIssue: nextHasIssue,
          issueNote: nextNote,
          extraDeliveryFee: nextExtra,
        });
        // Invalidate issue packages query
        queryClient.invalidateQueries({ queryKey: ["packages", "issues"] });
      }
      
      // Invalidate all package queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["package", packageData.id] });
      
      onClose();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to update package");
      console.error("Error updating package:", error);
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
