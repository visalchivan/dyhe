"use client";

import React from "react";
import { Drawer, Typography } from "antd";
import { DriverForm } from "./driver-form";
import { Driver, UpdateDriverDto } from "../../../../lib/api/drivers";
import { useUpdateDriver } from "../../../../hooks/useDrivers";

const { Title } = Typography;

interface EditDriverModalProps {
  driver: Driver | null;
  visible: boolean;
  onClose: () => void;
}

export const EditDriverModal: React.FC<EditDriverModalProps> = ({
  driver,
  visible,
  onClose,
}) => {
  const updateDriverMutation = useUpdateDriver();

  const handleSubmit = async (values: UpdateDriverDto) => {
    if (!driver) return;

    try {
      await updateDriverMutation.mutateAsync({
        id: driver.id,
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
          Edit Driver: {driver?.name}
        </Title>
      }
      width={800}
      open={visible}
      onClose={onClose}
      destroyOnClose
      closable
    >
      {driver && (
        <DriverForm
          driver={driver}
          onSubmit={handleSubmit}
          loading={updateDriverMutation.isPending}
          onCancel={onClose}
        />
      )}
    </Drawer>
  );
};
