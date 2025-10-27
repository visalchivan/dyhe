"use client";

import React, { useState } from "react";
import { DriversTable } from "./_components/drivers-table";
import { CreateDriverModal } from "./_components/create-modal";
import { EditDriverModal } from "./_components/edit-modal";
import { DriverDrawer } from "./_components/driver-drawer";
import { ChangeDriverPasswordModal } from "./_components/change-driver-password-modal";
import { Driver } from "../../../lib/api/drivers";

export default function DriversPage() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const handleCreateDriver = () => {
    setCreateModalVisible(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditModalVisible(true);
  };

  const handleViewDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setViewDrawerVisible(true);
  };

  const handleChangePassword = (driver: Driver) => {
    setSelectedDriver(driver);
    setChangePasswordModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setSelectedDriver(null);
  };

  const handleCloseViewDrawer = () => {
    setViewDrawerVisible(false);
    setSelectedDriver(null);
  };

  const handleCloseChangePasswordModal = () => {
    setChangePasswordModalVisible(false);
    setSelectedDriver(null);
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
      <DriversTable
        onCreateDriver={handleCreateDriver}
        onEditDriver={handleEditDriver}
        onViewDriver={handleViewDriver}
        onChangePassword={handleChangePassword}
      />

      <CreateDriverModal
        visible={createModalVisible}
        onClose={handleCloseCreateModal}
      />

      <EditDriverModal
        driver={selectedDriver}
        visible={editModalVisible}
        onClose={handleCloseEditModal}
      />

      <ChangeDriverPasswordModal
        driver={selectedDriver}
        visible={changePasswordModalVisible}
        onClose={handleCloseChangePasswordModal}
      />

      <DriverDrawer
        driver={selectedDriver}
        visible={viewDrawerVisible}
        onClose={handleCloseViewDrawer}
        onEdit={handleEditFromView}
        onChangePassword={handleChangePasswordFromView}
      />
    </div>
  );
}
