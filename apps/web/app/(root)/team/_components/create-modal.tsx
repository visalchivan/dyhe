"use client";

import React from "react";
import { Drawer, Typography } from "antd";
import { UserForm } from "./user-form";
import { CreateUserDto, UpdateUserDto } from "../../../../lib/api/team";
import { useCreateUser } from "../../../../hooks/useTeam";

const { Title } = Typography;

interface CreateUserModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  visible,
  onClose,
}) => {
  const createUserMutation = useCreateUser();

  const handleSubmit = async (values: CreateUserDto) => {
    try {
      await createUserMutation.mutateAsync(values);
      onClose();
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <Drawer
      title={
        <Title level={4} style={{ margin: 0 }}>
          Create New Team Member
        </Title>
      }
      width={800}
      open={visible}
      onClose={onClose}
      destroyOnClose
      closable
    >
      <UserForm
        onSubmit={
          handleSubmit as (values: CreateUserDto | UpdateUserDto) => void
        }
        loading={createUserMutation.isPending}
        onCancel={onClose}
      />
    </Drawer>
  );
};
