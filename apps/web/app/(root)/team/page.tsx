"use client";

import React, { useState } from "react";
import { TeamTable } from "./_components/team-table";
import { CreateUserModal } from "./_components/create-modal";
import { EditUserModal } from "./_components/edit-modal";
import { ChangePasswordModal } from "./_components/change-password-modal";
import { UserDrawer } from "./_components/user-drawer";
import { User } from "../../../lib/api/team";

export default function TeamPage() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleCreateUser = () => {
    setCreateModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalVisible(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewDrawerVisible(true);
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setChangePasswordModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setSelectedUser(null);
  };

  const handleCloseChangePasswordModal = () => {
    setChangePasswordModalVisible(false);
    setSelectedUser(null);
  };

  const handleCloseViewDrawer = () => {
    setViewDrawerVisible(false);
    setSelectedUser(null);
  };

  const handleEditFromView = () => {
    setViewDrawerVisible(false);
    setEditModalVisible(true);
  };

  const handleChangePasswordFromView = () => {
    setViewDrawerVisible(false);
    setChangePasswordModalVisible(true);
  };

  return (
    <div style={{ padding: 16 }}>
      <TeamTable
        onCreateUser={handleCreateUser}
        onEditUser={handleEditUser}
        onViewUser={handleViewUser}
        onChangePassword={handleChangePassword}
      />

      <CreateUserModal
        visible={createModalVisible}
        onClose={handleCloseCreateModal}
      />

      <EditUserModal
        user={selectedUser}
        visible={editModalVisible}
        onClose={handleCloseEditModal}
      />

      <ChangePasswordModal
        user={selectedUser}
        visible={changePasswordModalVisible}
        onClose={handleCloseChangePasswordModal}
      />

      <UserDrawer
        user={selectedUser}
        visible={viewDrawerVisible}
        onClose={handleCloseViewDrawer}
        onEdit={handleEditFromView}
        onChangePassword={handleChangePasswordFromView}
      />
    </div>
  );
}
