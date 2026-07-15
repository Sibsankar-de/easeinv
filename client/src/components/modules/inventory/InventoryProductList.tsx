"use client";

import { Select } from "@/components/ui/Select";
import { Plus, Edit2, Trash2, PackageSearch } from "lucide-react";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { SelectOptionType } from "@/types/SelectType";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  selectProductState,
  clearProductList,
} from "@/store/features/productSlice";
import { ProductDto } from "@/types/dto/productDto";
import { Button } from "@/components/ui/Button";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { pageLimits } from "@/constants/pageLimits";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { formatDateStr } from "@/utils/formatDate";
import { convertUnit } from "@/utils/conversion";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { ProductDeleteModal } from "./ProductDeleteModal";
import { getTableSearchDebounceTime } from "@/utils/get-debounce";
import { SearchInput } from "@/components/ui/SearchInput";
import { NavActionButton } from "../navbar/Navbar";
import { useNavContext } from "@/contexts/NavContext";

const categories: SelectOptionType[] = [
  { value: "All Categories", key: "all" },
  { value: "Services", key: "services" },
  { value: "Subscription", key: "subscription" },
];

const columnHelper = createColumnHelper<ProductDto>();

const ProductActions = ({ product }: { product: ProductDto }) => {
  const { navigate } = useStoreNavigation();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        className="p-2 text-indigo-400"
        tooltip="Edit product"
        onClick={() => navigate(`/inventory/product/${product?.id}/edit`)}
      >
        <Edit2 className="w-4 h-4" />
      </Button>
      <Button
        variant="danger"
        className="p-2"
        tooltip="Delete product"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      <ProductDeleteModal
        openState={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        product={product}
      />
    </div>
  );
};

export const InventoryProductList = () => {
  const { storeId, navigate } = useStoreNavigation();
  const { setActionButtons } = useNavContext();

  const dispatch = useDispatch();
  const {
    data: { productList },
    status,
  } = useSelector(selectProductState);
  const {
    data: { storeSettings, currencySymbol },
  } = useSelector(selectCurrentStoreState);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageLimits.PRODUCT_LIST,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const debounceCtx = React.useRef({ lastInputAt: 0, lastValueLength: 0 });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const currentPage = pagination.pageIndex + 1;

  // Debounce effect
  useEffect(() => {
    const delay = getTableSearchDebounceTime(searchTerm, debounceCtx.current);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      dispatch(clearProductList());
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  useEffect(() => {
    if (!productList.pages[currentPage]) {
      const sortField = sorting[0]?.id;
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      dispatch(
        fetchProducts({
          storeId,
          page: currentPage,
          limit: pagination.pageSize,
          query: debouncedSearchTerm || undefined,
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
    productList.pages,
    debouncedSearchTerm,
    sorting,
  ]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "sno",
        header: "Sno",
        enableSorting: false,
        cell: (info) => (
          <span className="text-primary">{info.row.index + 1}</span>
        ),
        meta: { className: "text-left w-16" },
      }),
      columnHelper.accessor("name", {
        header: "Product Name",
        cell: (info) => (
          <span className="text-gray-900 font-medium">{info.getValue()}</span>
        ),
        meta: { className: "text-left" },
      }),
      columnHelper.accessor("sku", {
        header: "SKU",
        cell: (info) => (
          <span className="text-gray-600">{info.getValue()}</span>
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("createdAt", {
        header: "Date added",
        cell: (info) => (
          <span className="text-gray-600">
            {info.getValue() ? formatDateStr(info.getValue()!).dashedDate : "-"}
          </span>
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.display({
        id: "price-qty",
        header: "Price / Qty",
        enableSorting: false,
        cell: (info) => (
          <span className="text-gray-900">
            <span>
              {currencySymbol}
              {Number(info.row.original.buyingPricePerQuantity?.toFixed(2))}
            </span>{" "}
            <span>/</span>{" "}
            <span>
              {convertUnit(
                info.row.original.stockUnit,
                storeSettings.customUnits,
              )}
            </span>
          </span>
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: (info) => <ProductActions product={info.row.original} />,
        meta: { className: "text-right" },
      }),
    ],
    [storeSettings.customUnits, currencySymbol],
  );

  const pageData = useMemo(
    () => productList.pages?.[currentPage]?.docs || [],
    [productList, currentPage],
  );

  useEffect(() => {
    setActionButtons(
      <NavActionButton
        onClick={() => {
          navigate(`/inventory/add-product`);
        }}
      >
        <Plus size={17} />
        Add Product
      </NavActionButton>,
    );
  }, []);

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <SearchInput
          placeholder="Search products by name or SKU..."
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
        />
        <Select
          options={categories}
          value={selectedCategory}
          onChange={(val) => {
            setSelectedCategory(val);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            dispatch(clearProductList());
          }}
          placeholder="Select category"
          className="min-w-40"
        />
      </div>

      <DataTable
        columns={columns}
        data={pageData}
        isLoading={status === "loading"}
        pageCount={productList.totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={(updater) => {
          const nextState =
            typeof updater === "function" ? updater(sorting) : updater;
          setSorting(nextState);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          dispatch(clearProductList());
        }}
        emptyState={
          <EmptyState
            icon={<PackageSearch className="w-8 h-8 text-gray-400" />}
            title="No products found"
            description="Your inventory is empty. Start adding products to manage your stock and create invoices."
            action={
              <Button onClick={() => navigate("/inventory/add-product")}>
                <Plus size={17} />
                Add new product
              </Button>
            }
          />
        }
      />
    </div>
  );
};
