"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Globe,
  DollarSign,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { pageLimits } from "@/constants/pageLimits";
import {
  fetchShippingProfilesThunk,
  invalidateShippingProfilePages,
  selectShippingProfileState,
} from "@/store/features/shippingProfileSlice";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { ShippingProfileSummaryDto } from "@/types/dto/shippingProfileDto";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  DebounceContext,
  getTableSearchDebounceTime,
} from "@/utils/get-debounce";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { SelectOptionType } from "@/types/SelectType";
import { formatDateStr } from "@/utils/formatDate";
import { ShippingProfileDeleteModal } from "./modals/ShippingProfileDeleteModal";
import { AppDispatch } from "@/store/store";
import Link from "next/link";

const activeFilterOptions: SelectOptionType[] = [
  { key: "all", value: "All Profiles" },
  { key: "true", value: "Active Only" },
  { key: "false", value: "Inactive Only" },
];

const columnHelper = createColumnHelper<ShippingProfileSummaryDto>();

const ProfileActions = ({
  profile,
}: {
  profile: ShippingProfileSummaryDto;
}) => {
  const { storeId, navigate } = useStoreNavigation();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="outline"
        className="p-2 text-primary hover:text-primary-hover"
        tooltip="Manage Zones & Rates"
        onClick={() => navigate(`/settings/shipping/${profile.id}`)}
      >
        <Eye className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        className="p-2 text-gray-700 hover:text-gray-900"
        tooltip="Edit Profile"
        onClick={() => navigate(`/settings/shipping/${profile.id}/edit`)}
      >
        <Edit2 className="w-4 h-4" />
      </Button>

      <Button
        variant="danger"
        className="p-2"
        tooltip="Delete Profile"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <ShippingProfileDeleteModal
        openState={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        profile={profile}
      />
    </div>
  );
};

export const ShippingProfileListTable = () => {
  const { storeId, navigate } = useStoreNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: { shippingProfilePagedData },
    status,
  } = useSelector(selectShippingProfileState);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageLimits.SHIPPING_PROFILE_LIST,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const debounceCtx = useRef<DebounceContext>({});

  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (trimmed === debouncedSearch) return;

    const delay = getTableSearchDebounceTime(searchTerm, debounceCtx.current);
    const handler = setTimeout(() => {
      setDebouncedSearch(trimmed);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      dispatch(invalidateShippingProfilePages());
    }, delay);

    return () => clearTimeout(handler);
  }, [searchTerm, debouncedSearch, dispatch]);

  const currentPage = pagination.pageIndex + 1;

  const pageData = useMemo(() => {
    return shippingProfilePagedData?.pages?.[currentPage]?.docs || [];
  }, [shippingProfilePagedData, currentPage]);

  useEffect(() => {
    if (!shippingProfilePagedData?.pages?.[currentPage] && storeId) {
      const sortField = sorting[0]?.id || "createdAt";
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      let isActive: boolean | undefined = undefined;
      if (activeFilter === "true") isActive = true;
      if (activeFilter === "false") isActive = false;

      dispatch(
        fetchShippingProfilesThunk({
          storeId,
          page: currentPage,
          limit: pagination.pageSize,
          query: debouncedSearch || undefined,
          isActive,
          sortBy: sortField,
          sortOrder,
        }),
      );
    }
  }, [
    storeId,
    currentPage,
    pagination.pageSize,
    debouncedSearch,
    activeFilter,
    sorting,
    shippingProfilePagedData?.pages,
    dispatch,
  ]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Profile Name",
        cell: (info) => {
          const profile = info.row.original;
          return (
            <div className="space-y-0.5">
              <Link
                href={`/stores/${storeId}/settings/shipping/${profile.id}`}
                className="font-semibold text-gray-900 hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <span>{profile.name}</span>
              </Link>
              {profile.description && (
                <p className="text-xs text-gray-500 max-w-sm truncate">
                  {profile.description}
                </p>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("zoneCount", {
        header: "Delivery Zones",
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-sm text-gray-700">
            <Globe className="w-4 h-4 text-gray-400" />
            <span>{info.getValue()} zones</span>
          </div>
        ),
      }),
      columnHelper.accessor("ruleCount", {
        header: "Rate Rules",
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-sm text-gray-700">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span>{info.getValue()} rules</span>
          </div>
        ),
      }),
      columnHelper.accessor("isActive", {
        header: "Status",
        cell: (info) => {
          const isActive = info.getValue();
          return (
            <Badge variant={isActive ? "success" : "outline"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Created Date",
        cell: (info) => (
          <span className="text-xs text-gray-600">
            {formatDateStr(info.getValue()).dateStr}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: (info) => <ProfileActions profile={info.row.original} />,
      }),
    ],
    [storeId],
  );

  const tableData = pageData;
  const totalCount = shippingProfilePagedData.totalDocs || 0;
  const isLoading = status === "loading";

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search shipping profiles..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end">
          <div className="w-full sm:w-44">
            <Select
              value={activeFilter}
              options={activeFilterOptions}
              onChange={(val) => {
                setActiveFilter(val as string);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                dispatch(invalidateShippingProfilePages());
              }}
              className="w-full"
            />
          </div>

          <Button
            onClick={() => navigate("/settings/shipping/create")}
            className="flex items-center gap-2 shrink-0 justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Create Profile</span>
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tableData}
        pageCount={shippingProfilePagedData?.totalPages || 0}
        pagination={pagination}
        onPaginationChange={(updater) => {
          const next =
            typeof updater === "function" ? updater(pagination) : updater;
          if (next.pageSize !== pagination.pageSize) {
            dispatch(invalidateShippingProfilePages());
            setPagination({ ...next, pageIndex: 0 });
          } else {
            setPagination(next);
          }
        }}
        sorting={sorting}
        onSortingChange={(updater) => {
          const nextState =
            typeof updater === "function" ? updater(sorting) : updater;
          setSorting(nextState);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          dispatch(invalidateShippingProfilePages());
        }}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={<Truck className="w-8 h-8 text-gray-400" />}
            title={
              debouncedSearch || activeFilter !== "all"
                ? "No shipping profiles found"
                : "No shipping profiles configured"
            }
            description={
              debouncedSearch || activeFilter !== "all"
                ? "Try adjusting your search or active status filter criteria."
                : "Create your first shipping profile to define delivery zones and rates."
            }
            action={
              !debouncedSearch && activeFilter === "all" ? (
                <Button onClick={() => navigate("/settings/shipping/create")}>
                  <Plus className="w-4 h-4" />
                  Create First Profile
                </Button>
              ) : undefined
            }
          />
        }
      />
    </div>
  );
};
