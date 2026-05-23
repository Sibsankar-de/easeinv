"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { useNavContext } from "@/contexts/NavContext";
import { NavActionButton } from "@/components/modules/navbar/navbar";
import { Mail, Trash2, Edit2, UserPlus, Users, Search } from "lucide-react";
import { toast } from "react-toastify";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDispatch, useSelector } from "react-redux";
import {
  addStoreAccessorThunk,
  fetchAccessorsListThunk,
  removeStoreAccessorThunk,
  selectCurrentStoreState,
  updateStoreAccessorRoleThunk,
} from "@/store/features/currentStoreSlice";
import { StoreAccessorDto } from "@/types/dto/storeDto";
import { Badge } from "@/components/ui/Badge";
import { RoleBadgeVarient } from "@/constants/storeUserRole";

const ROLES = [
  { key: "MANAGER", value: "Manager" },
  { key: "EMPLOYEE", value: "Employee" },
];

const StoreUserActions = ({ row }: { row: StoreAccessorDto }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isOwner = row.role === "OWNER";

  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        className="p-2"
        tooltip="Edit role"
        disabled={isOwner}
        onClick={() => setEditOpen(true)}
      >
        <Edit2 className="w-4 h-4 text-gray-500" />
      </Button>
      <Button
        variant="danger"
        className="p-2"
        tooltip="Remove access"
        disabled={isOwner}
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <UserRoleEditModal
        openState={editOpen}
        userData={row}
        onClose={() => setEditOpen(false)}
      />

      <UserDeleteModal
        openState={deleteOpen}
        userData={row}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
};

export const AccessControlSettingsComponent = () => {
  const { storeId } = useStoreNavigation();
  const { setActionButtons } = useNavContext();
  const dispatch = useDispatch();
  const {
    data: { accessorsList },
    accessorsStatus,
  } = useSelector(selectCurrentStoreState);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAccessorsListThunk(storeId));
  }, [storeId, dispatch]);

  useEffect(() => {
    setActionButtons(
      <NavActionButton onClick={() => setIsAddModalOpen(true)}>
        <UserPlus className="w-4 h-4 mr-2" />
        Add User
      </NavActionButton>,
    );
  }, [setActionButtons]);

  const columns = useMemo<ColumnDef<StoreAccessorDto>[]>(
    () => [
      {
        header: "User",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-900">
              {row.original.userName}
            </span>
          </div>
        ),
      },
      {
        header: "Email",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4" />
            {row.original.email}
          </div>
        ),
      },
      {
        header: "Role",
        cell: ({ row }) => (
          <Badge variant={RoleBadgeVarient[row.original.role]}>
            {row.original.role}
          </Badge>
        ),
        meta: { className: "text-center" },
      },
      {
        header: "Actions",
        meta: { className: "text-right" },
        cell: ({ row }) => StoreUserActions({ row: row.original }),
      },
    ],
    [accessorsList],
  );

  const isLoading = accessorsStatus === "loading";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by email or name"
            // value={searchTerm}
            // onChange={(val) => setSearchTerm(val)}
            className="pl-10"
          />
        </div>
        <Button className="py-2" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={accessorsList}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            title="No users found"
            description="Start by adding a user to your store."
            icon={<Users />}
          />
        }
      />

      <UserAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

const UserAddModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { accessorAddStatus } = useSelector(selectCurrentStoreState);
  const [formData, setFormData] = useState({ email: "", role: "EMPLOYEE" });

  const handleAddUser = () => {
    if (!formData.email) {
      toast.error("Email is required.");
      return;
    }

    dispatch(
      addStoreAccessorThunk({
        storeId: storeId,
        userData: formData,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("User added successfully.");
        onClose();
      });
  };

  const isSubmitting = accessorAddStatus === "loading";
  return (
    <Modal openState={isOpen} onClose={onClose} className="space-y-4 p-4 w-lg">
      <div>
        <h5 className="text-xl">Add new User</h5>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" required>
          User Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e })}
        />
        <p className="text-xs text-gray-500 italic">
          User must be already registered with EaseInv.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role" required>
          Assign Role
        </Label>
        <Select
          id="role"
          options={ROLES}
          value={formData.role}
          onChange={(val) => setFormData({ ...formData, role: val })}
        />
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="none" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="dark"
          loading={isSubmitting}
          disabled={isSubmitting || !formData.email}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </div>
    </Modal>
  );
};

const UserRoleEditModal = ({
  openState,
  userData,
  onClose,
}: {
  openState: boolean;
  userData: StoreAccessorDto;
  onClose: () => void;
}) => {
  const dispatch = useDispatch();
  const { accessorUpdateStatus } = useSelector(selectCurrentStoreState);
  const [formData, setFormData] = useState({ role: userData.role });

  const handleUpdateRole = () => {
    if (formData.role === userData.role) {
      toast.info("No changes made to the role.");
      onClose();
      return;
    }
    dispatch(
      updateStoreAccessorRoleThunk({
        storeId: userData.storeId,
        userId: userData.userId,
        newRole: formData.role,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("User role updated successfully.");
        onClose();
      });
  };

  const isSubmitting = accessorUpdateStatus === "loading";
  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="space-y-4 p-4 min-w-lg"
    >
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <Avatar userName={userData.userName} className="w-10 h-10" />
        <div>
          <p className="font-medium">{userData.userName}</p>
          <p className="text-sm text-gray-500">{userData.email}</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-role" required>
          Role
        </Label>
        <Select
          id="edit-role"
          options={ROLES}
          value={formData.role}
          onChange={(val) => setFormData({ ...formData, role: val })}
        />
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="none" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="dark"
          loading={isSubmitting}
          disabled={isSubmitting || formData.role === userData.role}
          onClick={handleUpdateRole}
        >
          Update Role
        </Button>
      </div>
    </Modal>
  );
};

const UserDeleteModal = ({
  openState,
  userData,
  onClose,
}: {
  openState: boolean;
  userData: StoreAccessorDto;
  onClose: () => void;
}) => {
  const dispatch = useDispatch();
  const { accessorDeleteStatus } = useSelector(selectCurrentStoreState);

  const handleDeleteUser = () => {
    dispatch(
      removeStoreAccessorThunk({
        storeId: userData.storeId,
        userId: userData.userId,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("User access removed successfully.");
        onClose();
      });
  };

  const isSubmitting = accessorDeleteStatus === "loading";
  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="space-y-6 p-4 w-lg"
    >
      <div>
        <h5 className="text-xl">Remove Access</h5>
      </div>
      <p className="text-gray-600">
        Are you sure you want to remove <strong>{userData.userName}</strong>'s
        access to this store? They will no longer be able to view or manage any
        data in this workspace.
      </p>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="none" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          // className="text-red-400"
          loading={isSubmitting}
          disabled={isSubmitting}
          onClick={handleDeleteUser}
        >
          Remove Access
        </Button>
      </div>
    </Modal>
  );
};
