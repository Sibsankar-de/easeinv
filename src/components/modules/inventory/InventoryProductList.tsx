"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { InventoryProductCard } from "./InventoryProductCard";
import { SelectOptionType } from "@/types/SelectType";
import { Pagination } from "@/components/ui/Pagination";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  selectProductState,
} from "@/store/features/productSlice";
import { ProductDto } from "@/types/dto/productDto";
import { Button } from "@/components/ui/Button";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { PageState } from "@/types/PageableType";
import { pageLimits } from "@/constants/pageLimits";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PackageSearch } from "lucide-react";

const categories: SelectOptionType[] = [
  { value: "All Categories", key: "all" },
  { value: "Services", key: "services" },
  { value: "Subscription", key: "subscription" },
];

export const InventoryProductList = () => {
  const { storeId, navigate } = useStoreNavigation();
  const dispatch = useDispatch();
  const {
    data: { productList },
    status,
  } = useSelector(selectProductState);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageData, setPageData] = useState<PageState<ProductDto> | null>(null);

  useEffect(() => {
    if (!productList.pages[currentPage]) {
      dispatch(
        fetchProducts({
          storeId,
          page: currentPage,
          limit: pageLimits.PRODUCT_LIST,
        }),
      )
        .unwrap()
        .then((res: any) => {
          setCurrentPage(res.page);
        });
    }
  }, [dispatch, storeId, currentPage]);

  useEffect(() => {
    const data = productList.pages?.[currentPage] || null;
    if (data) {
      setPageData(data);
    }
  }, [productList, currentPage]);

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products by name or SKU..."
              // value={searchTerm}
              // onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            options={categories}
            placeholder="Select category"
            className="min-w-40"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          {status === "loading" ? (
            <TableSkeleton columns={6} rows={pageLimits.PRODUCT_LIST} />
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-primary px-6 py-4">Sno</th>
                    <th className="text-left text-gray-700 px-6 py-4">
                      Product Name
                    </th>
                    <th className="text-center text-gray-700 px-6 py-4">SKU</th>
                    <th className="text-center text-gray-700 px-6 py-4">
                      Date added
                    </th>
                    <th className="text-center text-gray-700 px-6 py-4">
                      Price / Qty
                    </th>
                    <th className="text-center text-gray-700 px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageData?.docs.map((product, index) => (
                    <InventoryProductCard
                      key={product._id}
                      product={product}
                      index={index + 1}
                    />
                  ))}
                </tbody>
              </table>
              {status !== "loading" && pageData?.docs.length === 0 && (
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
              )}
            </>
          )}
        </div>
      </div>

      <Pagination
        totalPage={productList.totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
