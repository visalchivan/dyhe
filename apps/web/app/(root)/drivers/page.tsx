"use client";

import React, { useState } from "react";
import { DriversTable } from "./_components/drivers-table";
import { CreateDriverModal } from "./_components/create-modal";
import { EditDriverModal } from "./_components/edit-modal";
import { DriverDrawer } from "./_components/driver-drawer";
import { Driver } from "../../../lib/api/drivers";

export default function DriversPage() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
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

  const handleEditFromView = () => {
    setViewDrawerVisible(false);
    setEditModalVisible(true);
  };

  return (
    <div style={{ padding: 16 }}>
      <DriversTable
        onCreateDriver={handleCreateDriver}
        onEditDriver={handleEditDriver}
        onViewDriver={handleViewDriver}
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

      <DriverDrawer
        driver={selectedDriver}
        visible={viewDrawerVisible}
        onClose={handleCloseViewDrawer}
        onEdit={handleEditFromView}
      />
    </div>
  );
}
