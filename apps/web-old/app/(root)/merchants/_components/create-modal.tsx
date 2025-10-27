"use client";

import React from "react";
import { Drawer, Typography } from "antd";
import { MerchantForm } from "./merchant-form";
import {
  CreateMerchantDto,
  UpdateMerchantDto,
} from "../../../../lib/api/merchants";
import { useCreateMerchant } from "../../../../hooks/useMerchants";

const { Title } = Typography;

interface CreateMerchantModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateMerchantModal: React.FC<CreateMerchantModalProps> = ({
  visible,
  onClose,
}) => {
  const createMerchantMutation = useCreateMerchant();

  const handleSubmit = async (values: CreateMerchantDto) => {
    try {
      await createMerchantMutation.mutateAsync(values);
      onClose();
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <Drawer
      title={
        <Title level={4} style={{ margin: 0 }}>
          Create New Merchant
        </Title>
      }
      width={800}
      open={visible}
      onClose={onClose}
      destroyOnClose
      closable
    >
      <MerchantForm
        onSubmit={
          handleSubmit as (
            values: CreateMerchantDto | UpdateMerchantDto
          ) => void
        }
        loading={createMerchantMutation.isPending}
        onCancel={onClose}
      />
    </Drawer>
  );
};
