"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Ticket,
  Edit2,
  Trash2,
  Plus,
  Percent,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { pageLimits } from "@/constants/pageLimits";
import {
  fetchCouponListThunk,
  selectCouponState,
  invalidateCouponPages,
} from "@/store/features/couponSlice";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { CouponDto } from "@/types/dto/couponDto";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getTableSearchDebounceTime } from "@/utils/get-debounce";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { SelectOptionType } from "@/types/SelectType";
import { formatDateStr } from "@/utils/formatDate";
import { CouponDeleteModal } from "./CouponDeleteModal";
import { useNavContext } from "@/contexts/NavContext";
import { NavActionButton } from "../navbar/Navbar";
import { AppDispatch } from "@/store/store";

const columnHelper = createColumnHelper<CouponDto>();

const CouponActions = ({ coupon }: { coupon: CouponDto }) => {
  const { navigate } = useStoreNavigation();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        className="p-2 text-indigo-500 hover:text-indigo-600"
        tooltip="Edit coupon"
        onClick={() => navigate(`/coupons/${coupon.id}/edit`)}
      >
        <Edit2 className="w-4 h-4" />
      </Button>
      <Button
        variant="danger"
        className="p-2"
        tooltip="Delete coupon"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      <CouponDeleteModal
        openState={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        coupon={coupon}
      />
    </div>
  );
};

const statusOptions: SelectOptionType[] = [
  { key: "all", value: "All Status" },
  { key: "active", value: "Active" },
  { key: "inactive", value: "Inactive" },
];

const discountTypeOptions: SelectOptionType[] = [
  { key: "all", value: "All Types" },
  { key: "PERCENT", value: "Percentage (%)" },
  { key: "FIXED", value: "Fixed Amount" },
];

export const CouponListTable = () => {
  const { storeId, navigate } = useStoreNavigation();
  const { setActionButtons } = useNavContext();
  const dispatch = useDispatch<AppDispatch>();

  const {
    data: { couponListData },
    status,
  } = useSelector(selectCouponState);

  const {
    data: { currencySymbol },
  } = useSelector(selectCurrentStoreState);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageLimits.COUPON_LIST,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const debounceCtx = React.useRef({ lastInputAt: 0, lastValueLength: 0 });

  const [statusFilter, setStatusFilter] = useState("all");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("all");

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  // Debounced search handling
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (trimmed === debouncedSearchTerm) {
      return;
    }
    const delay = getTableSearchDebounceTime(searchTerm, debounceCtx.current);
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(trimmed);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      dispatch(invalidateCouponPages());
    }, delay);

    return () => clearTimeout(handler);
  }, [searchTerm, debouncedSearchTerm, dispatch]);

  const currentPage = pagination.pageIndex + 1;

  const pageData = useMemo(() => {
    return couponListData.pages[currentPage]?.docs || [];
  }, [couponListData, currentPage]);

  useEffect(() => {
    if (!couponListData.pages[currentPage]) {
      const sortField = sorting[0]?.id || "createdAt";
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      const isActiveParam =
        statusFilter === "active"
          ? true
          : statusFilter === "inactive"
            ? false
            : undefined;

      const discountTypeParam =
        discountTypeFilter !== "all" ? discountTypeFilter : undefined;

      dispatch(
        fetchCouponListThunk({
          storeId,
          page: currentPage,
          limit: pagination.pageSize,
          query: debouncedSearchTerm || undefined,
          isActive: isActiveParam,
          discountType: discountTypeParam,
          sortBy: sortField,
          sortOrder,
        }),
      );
    }
  }, [
    dispatch,
    storeId,
    currentPage,
    pagination.pageSize,
    debouncedSearchTerm,
    statusFilter,
    discountTypeFilter,
    sorting,
    couponListData.pages,
  ]);

  useEffect(() => {
    setActionButtons(
      <NavActionButton onClick={() => navigate("/coupons/add-coupon")}>
        <Plus size={17} />
        Create Coupon
      </NavActionButton>,
    );
  }, [setActionButtons, navigate]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("code", {
        header: "Coupon Code",
        enableSorting: true,
        cell: (info) => {
          const coupon = info.row.original;
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge>{coupon.code}</Badge>
              </div>
              <span className="font-medium text-gray-900 text-sm">
                {coupon.name}
              </span>
              {coupon.description && (
                <span className="text-gray-500 text-xs line-clamp-1">
                  {coupon.description}
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("discountValue", {
        header: "Discount",
        enableSorting: true,
        cell: (info) => {
          const coupon = info.row.original;
          const isPercent = coupon.discountType === "PERCENT";
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 flex items-center gap-1">
                {isPercent ? (
                  <>{coupon.discountValue}%</>
                ) : (
                  <>
                    {currencySymbol}
                    {coupon.discountValue.toFixed(2)}
                  </>
                )}
              </span>
              {isPercent && coupon.maxDiscount ? (
                <span className="text-gray-500 text-xs">
                  Max: {currencySymbol}
                  {coupon.maxDiscount.toFixed(2)}
                </span>
              ) : null}
            </div>
          );
        },
      }),
      columnHelper.accessor("minOrderValue", {
        header: "Min Order",
        enableSorting: true,
        cell: (info) => {
          const min = info.getValue();
          return (
            <span className="text-gray-700 text-sm">
              {min && min > 0 ? `${currencySymbol}${min.toFixed(2)}` : "None"}
            </span>
          );
        },
      }),
      columnHelper.accessor("usageCount", {
        header: "Usage",
        enableSorting: true,
        cell: (info) => {
          const coupon = info.row.original;
          const limit = coupon.usageLimit;
          return (
            <div className="flex flex-col text-sm">
              <span className="text-gray-900 font-medium">
                {coupon.usageCount} {limit ? `/ ${limit}` : ""}
              </span>
              {coupon.perCustomerLimit && (
                <span className="text-gray-500 text-xs">
                  {coupon.perCustomerLimit} per customer
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("categoryCount", {
        header: "Categories",
        enableSorting: false,
        cell: (info) => {
          const count = info.getValue() || 0;
          if (count === 0) {
            return (
              <Badge variant="secondary" className="font-normal text-xs">
                All Categories
              </Badge>
            );
          }
          return (
            <Badge
              variant="outline"
              className="text-xs bg-gray-50 text-gray-700 font-medium"
            >
              {count} {count === 1 ? "Category" : "Categories"}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("startsAt", {
        header: "Validity",
        enableSorting: true,
        cell: (info) => {
          const coupon = info.row.original;
          if (!coupon.startsAt && !coupon.endsAt) {
            return <span className="text-gray-500 text-xs">Always Valid</span>;
          }
          return (
            <div className="flex flex-col text-xs text-gray-600 gap-0.5">
              {coupon.startsAt && (
                <span>From: {formatDateStr(coupon.startsAt).dateStr}</span>
              )}
              {coupon.endsAt && (
                <span>To: {formatDateStr(coupon.endsAt).dateStr}</span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("isActive", {
        header: "Status",
        enableSorting: false,
        cell: (info) => {
          const isActive = info.getValue();
          return isActive ? (
            <Badge variant="success" className="gap-1 font-medium text-xs">
              <CheckCircle2 className="w-3 h-3" />
              Active
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="gap-1 font-medium text-xs text-gray-500"
            >
              <XCircle className="w-3 h-3" />
              Inactive
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => <CouponActions coupon={info.row.original} />,
        meta: { className: "text-right" },
      }),
    ],
    [currencySymbol],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto max-w-md">
          <SearchInput
            placeholder="Search coupon by code or name..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="w-36">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                dispatch(invalidateCouponPages());
              }}
            />
          </div>

          <div className="w-40">
            <Select
              options={discountTypeOptions}
              value={discountTypeFilter}
              onChange={(val) => {
                setDiscountTypeFilter(val);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                dispatch(invalidateCouponPages());
              }}
            />
          </div>

          <Button
            onClick={() => navigate("/coupons/add-coupon")}
            className="gap-1.5"
          >
            <Plus size={16} />
            Add Coupon
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pageData}
        isLoading={status === "loading"}
        pageCount={couponListData.totalPages}
        pagination={pagination}
        onPaginationChange={(updater) => {
          const next =
            typeof updater === "function" ? updater(pagination) : updater;
          if (next.pageSize !== pagination.pageSize) {
            dispatch(invalidateCouponPages());
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
          dispatch(invalidateCouponPages());
        }}
        emptyState={
          <EmptyState
            icon={<Ticket className="w-8 h-8 text-gray-400" />}
            title="No coupons found"
            description={
              searchTerm ||
              statusFilter !== "all" ||
              discountTypeFilter !== "all"
                ? "Try adjusting your search or filter options."
                : "Create promotional discount codes for your customers."
            }
            action={
              !searchTerm &&
              statusFilter === "all" &&
              discountTypeFilter === "all" ? (
                <Button onClick={() => navigate("/coupons/add-coupon")}>
                  <Plus size={16} />
                  Create First Coupon
                </Button>
              ) : undefined
            }
          />
        }
      />
    </div>
  );
};
