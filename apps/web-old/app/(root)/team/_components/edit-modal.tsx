"use client";

import React from "react";
import { Drawer, Typography } from "antd";
import { UserForm } from "./user-form";
import { User, UpdateUserDto } from "../../../../lib/api/team";
import { useUpdateUser } from "../../../../hooks/useTeam";

const { Title } = Typography;

interface EditUserModalProps {
  user: User | null;
  visible: boolean;
  onClose: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  visible,
  onClose,
}) => {
  const updateUserMutation = useUpdateUser();

  const handleSubmit = async (values: UpdateUserDto) => {
    if (!user) return;

    try {
      await updateUserMutation.mutateAsync({
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
          Edit Team Member: {user?.name}
        </Title>
      }
      width={800}
      open={visible}
      onClose={onClose}
      destroyOnClose
      closable
    >
      {user && (
        <UserForm
          user={user}
          onSubmit={handleSubmit}
          loading={updateUserMutation.isPending}
          onCancel={onClose}
        />
      )}
    </Drawer>
  );
};
