"use client";

import { Button } from "@/components/ui/Button";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { ProductDto } from "@/types/dto/productDto";
import { formatDateStr } from "@/utils/formatDate";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { ProductDeleteModal } from "./ProductDeleteModal";
import { convertUnit } from "@/utils/conversion";
import { useSelector } from "react-redux";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";

export const InventoryProductCard = ({
  index,
  product,
}: {
  index: number;
  product: ProductDto;
}) => {
  const {
    data: { storeSettings },
  } = useSelector(selectCurrentStoreState);
  const { navigate } = useStoreNavigation();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <span className="text-primary">{index}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-gray-900">{product.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-gray-600">{product.sku}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-gray-600">
          {formatDateStr(product.createdAt!).dashedDate}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-gray-900">
          <span>
            &#8377;{Number(product.buyingPricePerQuantity?.toFixed(2))}
          </span>{" "}
          <span>/</span>{" "}
          <span>
            {convertUnit(product.stockUnit, storeSettings.customUnits)}
          </span>
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="none"
            className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
            onClick={() => navigate(`/inventory/product/${product?._id}/edit`)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="none"
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            onClick={() => setIsDeleteOpen((p) => !p)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
      <ProductDeleteModal
        openState={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        product={product}
      />
    </tr>
  );
};
