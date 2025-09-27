"use client";

import React, { useState } from "react";
import { MerchantsTable } from "./_components/merchants-table";
import { CreateMerchantModal } from "./_components/create-modal";
import { EditMerchantModal } from "./_components/edit-modal";
import { MerchantDrawer } from "./_components/merchant-drawer";
import { Merchant } from "../../../lib/api/merchants";

export default function MerchantsPage() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null
  );

  const handleCreateMerchant = () => {
    setCreateModalVisible(true);
  };

  const handleEditMerchant = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setEditModalVisible(true);
  };

  const handleViewMerchant = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setViewDrawerVisible(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setSelectedMerchant(null);
  };

  const handleCloseViewDrawer = () => {
    setViewDrawerVisible(false);
    setSelectedMerchant(null);
  };

  const handleEditFromView = () => {
    setViewDrawerVisible(false);
    setEditModalVisible(true);
  };

  return (
    <div style={{ padding: 16 }}>
      <MerchantsTable
        onCreateMerchant={handleCreateMerchant}
        onEditMerchant={handleEditMerchant}
        onViewMerchant={handleViewMerchant}
      />

      <CreateMerchantModal
        visible={createModalVisible}
        onClose={handleCloseCreateModal}
      />

      <EditMerchantModal
        merchant={selectedMerchant}
        visible={editModalVisible}
        onClose={handleCloseEditModal}
      />

      <MerchantDrawer
        merchant={selectedMerchant}
        visible={viewDrawerVisible}
        onClose={handleCloseViewDrawer}
        onEdit={handleEditFromView}
      />
    </div>
  );
}
