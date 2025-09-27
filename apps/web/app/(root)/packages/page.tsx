"use client";

import React, { useState } from "react";
import { PackagesTable } from "./_components/packages-table";
import { CreatePackageModal } from "./_components/create-modal";
import { BulkCreatePackageModal } from "./_components/bulk-create-modal";
import { EditPackageModal } from "./_components/edit-modal";
import { PackageDrawer } from "./_components/package-drawer";
import { Package } from "../../../lib/api/packages";

export default function PackagesPage() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [bulkCreateModalVisible, setBulkCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const handleCreatePackage = () => {
    setCreateModalVisible(true);
  };

  const handleBulkCreatePackages = () => {
    setBulkCreateModalVisible(true);
  };

  const handleEditPackage = (packageData: Package) => {
    setSelectedPackage(packageData);
    setEditModalVisible(true);
  };

  const handleViewPackage = (packageData: Package) => {
    setSelectedPackage(packageData);
    setViewDrawerVisible(true);
  };

  const handleCloseModals = () => {
    setCreateModalVisible(false);
    setBulkCreateModalVisible(false);
    setEditModalVisible(false);
    setViewDrawerVisible(false);
    setSelectedPackage(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <PackagesTable
        onCreatePackage={handleCreatePackage}
        onBulkCreatePackages={handleBulkCreatePackages}
        onEditPackage={handleEditPackage}
        onViewPackage={handleViewPackage}
      />

      <CreatePackageModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />

      <BulkCreatePackageModal
        visible={bulkCreateModalVisible}
        onClose={() => setBulkCreateModalVisible(false)}
      />

      <EditPackageModal
        packageData={selectedPackage}
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
      />

      <PackageDrawer
        packageData={selectedPackage}
        visible={viewDrawerVisible}
        onClose={() => setViewDrawerVisible(false)}
        onEdit={handleEditPackage}
      />
    </div>
  );
}
