"use client";

import React from "react";
import { Drawer, Typography } from "antd";
import { DriverForm } from "./driver-form";
import { CreateDriverDto, UpdateDriverDto } from "../../../../lib/api/drivers";
import { useCreateDriver } from "../../../../hooks/useDrivers";

const { Title } = Typography;

interface CreateDriverModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateDriverModal: React.FC<CreateDriverModalProps> = ({
  visible,
  onClose,
}) => {
  const createDriverMutation = useCreateDriver();

  const handleSubmit = async (values: CreateDriverDto) => {
    try {
      await createDriverMutation.mutateAsync(values);
      onClose();
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <Drawer
      title={
        <Title level={4} style={{ margin: 0 }}>
          Create New Driver
        </Title>
      }
      width={800}
      open={visible}
      onClose={onClose}
      destroyOnClose
      closable
    >
      <DriverForm
        onSubmit={
          handleSubmit as (values: CreateDriverDto | UpdateDriverDto) => void
        }
        loading={createDriverMutation.isPending}
        onCancel={onClose}
      />
    </Drawer>
  );
};
