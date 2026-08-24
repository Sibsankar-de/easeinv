"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Trash2, FolderTree } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { CategoryDto } from "@/types/dto/categoryDto";
import {
  fetchCategoriesThunk,
  selectInventoryState,
} from "@/store/features/inventorySlice";
import { Button } from "@/components/ui/Button";
import { pageLimits } from "@/constants/pageLimits";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { paginate } from "@/utils/paginate";
import { cn } from "@/components/utils";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { useNavContext } from "@/contexts/NavContext";
import { NavActionButton } from "../navbar/Navbar";
import { CategoryCreateEditModal } from "./CategoryCreateEditModal";
import { CategoryDeleteModal } from "./CategoryDeleteModal";

const columnHelper = createColumnHelper<CategoryDto>();

interface CategoryActionsProps {
  category: CategoryDto;
  onEdit: (cat: CategoryDto) => void;
  onDelete: (cat: CategoryDto) => void;
}

const CategoryActions = ({
  category,
  onEdit,
  onDelete,
}: CategoryActionsProps) => {
  return (
    <div className={cn("flex items-center justify-end gap-2")}>
      <Button
        variant="outline"
        className={cn("p-2 text-indigo-400")}
        tooltip="Edit category"
        onClick={() => onEdit(category)}
      >
        <Edit2 className={cn("w-4 h-4")} />
      </Button>
      <Button
        variant="danger"
        className={cn("p-2")}
        tooltip="Delete category"
        onClick={() => onDelete(category)}
      >
        <Trash2 className={cn("w-4 h-4")} />
      </Button>
    </div>
  );
};

export const InventoryCategoryList = () => {
  const { storeId } = useStoreNavigation();
  const { setActionButtons } = useNavContext();
  const dispatch = useDispatch();

  const {
    data: { categoryList },
    categoryStatus,
  } = useSelector(selectInventoryState);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageLimits.CATEGORY_LIST || 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Modal states
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryDto | null>(
    null,
  );

  useEffect(() => {
    if (storeId && categoryList.length === 0) {
      dispatch(fetchCategoriesThunk(storeId));
    }
  }, [dispatch, storeId, categoryList.length]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedCategory(null);
    setIsCreateEditModalOpen(true);
  };

  const handleOpenEdit = (category: CategoryDto) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setIsCreateEditModalOpen(true);
  };

  const handleOpenDelete = (category: CategoryDto) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  useEffect(() => {
    setActionButtons(
      <NavActionButton onClick={handleOpenCreate}>
        <Plus size={17} />
        Add Category
      </NavActionButton>,
    );
  }, [setActionButtons]);

  // Search filter
  const filteredCategories = useMemo(() => {
    let result = categoryList;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((cat) => cat.name.toLowerCase().includes(q));
    }
    if (sorting.length > 0) {
      const sortField = sorting[0].id as keyof CategoryDto;
      const isDesc = sorting[0].desc;
      result = [...result].sort((a, b) => {
        const valA = a[sortField] || "";
        const valB = b[sortField] || "";
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }
    return result;
  }, [categoryList, searchTerm, sorting]);

  // Paginate list using paginate.ts utility
  const paginatedResult = useMemo(() => {
    return paginate(
      filteredCategories,
      pagination.pageSize,
      pagination.pageIndex + 1,
    );
  }, [filteredCategories, pagination.pageSize, pagination.pageIndex]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "sno",
        header: "Sno",
        enableSorting: false,
        cell: (info) => (
          <span className={cn("text-primary")}>
            {pagination.pageIndex * pagination.pageSize + info.row.index + 1}
          </span>
        ),
        meta: { className: "text-left w-16" },
      }),
      columnHelper.accessor("name", {
        header: "Category Name",
        cell: (info) => (
          <span className={cn("text-gray-900 font-medium")}>
            {info.getValue()}
          </span>
        ),
        meta: { className: "text-left" },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: (info) => (
          <CategoryActions
            category={info.row.original}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        ),
        meta: { className: "text-right" },
      }),
    ],
    [pagination.pageIndex, pagination.pageSize],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="w-full md:max-w-md flex-1">
          <SearchInput
            placeholder="Search category by name..."
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="gap-1.5 shrink-0 whitespace-nowrap"
          >
            <Plus size={16} />
            Add Category
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedResult.items || []}
        isLoading={categoryStatus === "loading"}
        pageCount={paginatedResult.totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={(updater) => {
          const nextState =
            typeof updater === "function" ? updater(sorting) : updater;
          setSorting(nextState);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
        emptyState={
          <EmptyState
            icon={<FolderTree className={cn("w-8 h-8 text-gray-400")} />}
            title="No categories found"
            description="Organize your product catalog by creating product categories."
            action={
              <Button onClick={handleOpenCreate}>
                <Plus size={17} />
                Add Category
              </Button>
            }
          />
        }
      />

      <CategoryCreateEditModal
        openState={isCreateEditModalOpen}
        onClose={() => setIsCreateEditModalOpen(false)}
        mode={modalMode}
        category={selectedCategory}
      />

      <CategoryDeleteModal
        openState={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        category={categoryToDelete}
      />
    </div>
  );
};
