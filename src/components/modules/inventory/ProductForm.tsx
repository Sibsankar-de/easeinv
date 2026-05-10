"use client";

import { Input } from "../../ui/Input";
import { Textarea } from "../../ui/Textarea";
import { Label } from "../../ui/Label";
import { CategorySelector } from "./CategorySelector";
import { StockUnitInput } from "../../ui/StockUnitInput";
import { PriceBreakdownInput } from "./PriceBreakdownInput";
import { Button } from "../../ui/Button";
import { CloudCheck, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { PricePerQuantityType } from "@/types/dto/productDto";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewProductThunk,
  getProductDetailsThunk,
  selectProductState,
  updateProductThunk,
} from "@/store/features/productSlice";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { StockInput } from "@/components/ui/StockInput";
import { Separator } from "@/components/ui/Separator";
import { ToggleButton } from "@/components/ui/ToggleButton";
import { CategoryDto } from "@/types/dto/categoryDto";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { FormSkeleton } from "@/components/ui/Skeleton";

export const ProductForm = ({ formFor }: { formFor: string }) => {
  const router = useRouter();
  const params = useParams();
  const storeId = params?.store_id;
  const productId = params?.product_id;
  const dispatch = useDispatch();
  const { getStatus, createStatus, updateStatus } =
    useSelector(selectProductState);
  const {
    data: { storeSettings },
  } = useSelector(selectCurrentStoreState);
  const { navigate } = useStoreNavigation();

  // Data state (Numeric values for backend)
  const [formData, setFormData] = useState<Record<string, any>>({
    name: "",
    sku: "",
    gtin: "",
    description: "",
    categories: [] as CategoryDto[],
    buyingPricePerQuantity: 0,
    stockUnit: "PCS",
    totalStock: 0,
    enableInventoryTracking: false,
    pricePerQuantity: [] as PricePerQuantityType[],
  });

  // UI State (String values for Inputs)
  const [localInputs, setLocalInputs] = useState({
    buyingPricePerQuantity: "",
    totalStock: "",
  });

  useEffect(() => {
    if (formFor === "edit" && productId) {
      dispatch(getProductDetailsThunk({ productId, storeId }))
        .unwrap()
        .then((product: any) => {
          setFormData(product);

          setLocalInputs({
            buyingPricePerQuantity:
              product.buyingPricePerQuantity !== undefined
                ? String(product.buyingPricePerQuantity)
                : "",
            totalStock:
              product.totalStock !== undefined
                ? String(product.totalStock)
                : "",
          });
        });
    }
  }, [productId, formFor]);

  function handleFormData(key: keyof typeof formData, value: any) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const handleNumberChange = (key: keyof typeof formData, rawValue: string) => {
    setLocalInputs((prev) => ({
      ...prev,
      [key]: rawValue,
    }));

    const numValue = parseFloat(rawValue);
    const safeValue = isNaN(numValue) ? 0 : numValue;

    handleFormData(key, safeValue);
  };

  const handleCreateProduct = () => {
    if (!formData || !storeId) return;
    dispatch(addNewProductThunk({ ...formData, storeId }))
      .unwrap()
      .then(() => {
        toast.success("Product created");
        navigate(`/inventory`);
      });
  };

  const handleUpdateProduct = () => {
    if (!formData || !storeId) return;
    dispatch(updateProductThunk({ ...formData, productId, storeId }))
      .unwrap()
      .then(() => {
        toast.success("Product updated");
        navigate(`/inventory`);
      });
  };

  const handleSaveProduct = () => {
    if (formFor === "create") handleCreateProduct();
    else handleUpdateProduct();
  };

  const isSubmitting = createStatus === "loading" || updateStatus === "loading";
  const isLoading =
    getStatus === "loading" ||
    createStatus === "loading" ||
    updateStatus === "loading";

  if (getStatus === "loading") {
    return <FormSkeleton rows={6} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name" className="block text-gray-600 mb-1.5" required>
          Product name
        </Label>
        <Input
          placeholder="Enter product name"
          id="name"
          value={formData.name}
          onChange={(e) => handleFormData("name", e)}
          disabled={isLoading}
        />
      </div>
      <div className="flex gap-6">
        <div className="flex-1">
          <Label htmlFor="sku" className="block text-gray-600 mb-1.5" required>
            Product SKU
          </Label>
          <Input
            placeholder="Enter sku"
            id="sku"
            value={formData.sku}
            onChange={(e) => handleFormData("sku", e)}
            disabled={isLoading}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="gtin" className="block text-gray-600 mb-1.5">
            GTIN / UPC / EAN / Barcode
          </Label>
          <Input
            placeholder="Enter GTIN"
            id="gtin"
            value={formData.gtin}
            onChange={(e) => handleFormData("gtin", e)}
            disabled={isLoading}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description" className="block text-gray-600 mb-1.5">
          Product description
        </Label>
        <Textarea
          placeholder="Write product description"
          id="description"
          value={formData.description}
          onChange={(e) => handleFormData("description", e)}
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="category" className="block text-gray-600 mb-1.5">
          Select categories
        </Label>
        <CategorySelector
          value={formData.categories}
          onChange={(e) => handleFormData("categories", e)}
        />
      </div>

      <Separator text={"Buying price"} className="mb-8 mt-10" />

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Label
            htmlFor="price"
            className="block text-gray-600 mb-1.5"
            required
          >
            Buying price (&#8377;)
          </Label>
          <Input
            type="number"
            placeholder="Enter price for 1 unit"
            id="price"
            value={localInputs.buyingPricePerQuantity}
            onChange={(e) => handleNumberChange("buyingPricePerQuantity", e)}
            disabled={isLoading}
          />
        </div>
        <p className="mt-7 text-gray-500">/</p>
        <div className="flex-1">
          <Label
            htmlFor="stock-unit"
            className="block text-gray-600 mb-1.5"
            required
          >
            Stock unit
          </Label>
          <StockUnitInput
            id="stock-unit"
            value={formData.stockUnit}
            onChange={(e) => handleFormData("stockUnit", e)}
            disabled={isLoading}
          />
        </div>
      </div>

      <Separator text={"Inventory tracking"} className="mb-8 mt-10" />

      <div>
        <div className="flex items-center gap-6 mb-3">
          <Label
            className="flex items-center gap-3 mb-0"
            htmlFor="enable-tracking"
          >
            <p>Enable Inventory tracking</p>
            <Info size={15} />
          </Label>
          <ToggleButton
            id="enable-tracking"
            isActive={formData.enableInventoryTracking}
            onChange={(e) => handleFormData("enableInventoryTracking", e)}
          />
        </div>
        <div className="flex-1">
          <Label
            htmlFor="stock"
            className="block text-gray-600 mb-1.5"
            required={formData.enableInventoryTracking}
          >
            Total Stock
          </Label>
          <StockInput
            type="number"
            id="stock"
            placeholder="Enter stock"
            value={localInputs.totalStock}
            unit={formData.stockUnit}
            onChange={(e) => handleNumberChange("totalStock", e)}
            disabled={!formData.enableInventoryTracking || isLoading}
          />
        </div>
      </div>

      <Separator text={"Selling price"} className="mb-8 mt-10" />

      <div>
        <Label htmlFor="price-breakdown" required>
          Add price per quantity (Selling prices)
        </Label>
        <div>
          <PriceBreakdownInput
            value={formData.pricePerQuantity}
            onChange={(e) => handleFormData("pricePerQuantity", e)}
            unit={formData.stockUnit}
            buyingPricePerItem={formData.buyingPricePerQuantity}
          />
        </div>
      </div>

      <div className="mt-10 flex items-center gap-3 justify-self-end">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          onClick={handleSaveProduct}
          disabled={isLoading}
          loading={isSubmitting}
        >
          <CloudCheck size={17} />
          Save product
        </Button>
      </div>
    </div>
  );
};
