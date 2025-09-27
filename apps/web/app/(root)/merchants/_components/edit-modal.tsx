"use client";

import React from "react";
import { Drawer, Typography } from "antd";
import { MerchantForm } from "./merchant-form";
import { Merchant, UpdateMerchantDto } from "../../../../lib/api/merchants";
import { useUpdateMerchant } from "../../../../hooks/useMerchants";

const { Title } = Typography;

interface EditMerchantModalProps {
  merchant: Merchant | null;
  visible: boolean;
  onClose: () => void;
}

export const EditMerchantModal: React.FC<EditMerchantModalProps> = ({
  merchant,
  visible,
  onClose,
}) => {
  const updateMerchantMutation = useUpdateMerchant();

  const handleSubmit = async (values: UpdateMerchantDto) => {
    if (!merchant) return;

    try {
      await updateMerchantMutation.mutateAsync({
        id: merchant.id,
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
          Edit Merchant: {merchant?.name}
        </Title>
      }
      width={800}
      open={visible}
      onClose={onClose}
      destroyOnClose
      closable
    >
      {merchant && (
        <MerchantForm
          merchant={merchant}
          onSubmit={handleSubmit}
          loading={updateMerchantMutation.isPending}
          onCancel={onClose}
        />
      )}
    </Drawer>
  );
};
