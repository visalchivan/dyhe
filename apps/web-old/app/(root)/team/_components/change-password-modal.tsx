"use client";

import React from "react";
import { Drawer, Typography } from "antd";
import { ChangePasswordForm } from "./change-password-form";
import { User, ChangePasswordDto } from "../../../../lib/api/team";
import { useChangePassword } from "../../../../hooks/useTeam";

const { Title } = Typography;

interface ChangePasswordModalProps {
  user: User | null;
  visible: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  user,
  visible,
  onClose,
}) => {
  const changePasswordMutation = useChangePassword();

  const handleSubmit = async (values: ChangePasswordDto) => {
    if (!user) return;

    try {
      await changePasswordMutation.mutateAsync({
        id: user.id,
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
          Change Password: {user?.name}
        </Title>
      }
      width={600}
      open={visible}
      onClose={onClose}
      destroyOnClose
      closable
    >
      <ChangePasswordForm
        onSubmit={handleSubmit}
        loading={changePasswordMutation.isPending}
        onCancel={onClose}
      />
    </Drawer>
  );
};
