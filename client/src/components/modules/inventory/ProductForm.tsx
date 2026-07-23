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
import {
  PricePerQuantityType,
  ProductDto,
  ProductImageType,
  UnitGroupType,
} from "@/types/dto/productDto";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewProductThunk,
  getProductDetailsThunk,
  selectInventoryState,
  updateProductThunk,
} from "@/store/features/inventorySlice";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { StockInput } from "@/components/ui/StockInput";
import { Separator } from "@/components/ui/Separator";
import { ToggleButton } from "@/components/ui/ToggleButton";
import { CategoryDto } from "@/types/dto/categoryDto";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { useNavContext } from "@/contexts/NavContext";
import { NavActionButton } from "../navbar/Navbar";
import { IconTooltip } from "@/components/ui/IconTooltip";
import descriptiveTooltip from "@/constants/descriptiveTooltip";
import { ProductImageSection } from "./ProductImageSection";
import { UnitGroupsSection } from "./UnitGroupsSection";
import { SelectOptionType } from "@/types/SelectType";
import { convertUnit } from "@/utils/conversion";
import { unitMap } from "@/constants/UnitMaps";

export const ProductForm = ({ formFor }: { formFor: string }) => {
  const router = useRouter();
  const params = useParams();
  const storeId = params?.store_id as string;
  const productId = params?.product_id;
  const dispatch = useDispatch();
  const { getStatus, createStatus, updateStatus } =
    useSelector(selectInventoryState);
  const {
    data: { storeSettings, currencySymbol },
  } = useSelector(selectCurrentStoreState);
  const { navigate } = useStoreNavigation();
  const { setActionButtons } = useNavContext();

  // Data state (Numeric values for backend)
  const [formData, setFormData] = useState<Record<string, any>>({
    name: "",
    sku: "",
    gtin: "",
    description: "",
    categoryIds: [] as string[],
    buyingPricePerQuantity: 0,
    stockUnit: unitMap[0].key,
    totalStock: 0,
    trackInventory: false,
    alertThreshold: 0,
    emailAlert: false,
    pricePerQuantity: [] as PricePerQuantityType[],
    imageIds: [] as string[],
    unitGroups: [] as UnitGroupType[],
  });

  const [selectedImages, setSelectedImages] = useState<ProductImageType[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryDto[]>(
    [],
  );

  // UI State (String values for Inputs)
  const [localInputs, setLocalInputs] = useState({
    buyingPricePerQuantity: "",
    totalStock: "",
    alertThreshold: "",
  });

  useEffect(() => {
    if (formFor === "edit" && productId) {
      dispatch(getProductDetailsThunk({ productId, storeId }))
        .unwrap()
        .then((product: ProductDto) => {
          setFormData({
            ...product,
            imageIds: product.images?.map((img: any) => img.id) || [],
            unitGroups: product.unitGroups || [],
          });
          setSelectedImages(product.images || []);
          setSelectedCategories(product.categories || []);

          setLocalInputs({
            buyingPricePerQuantity:
              product.buyingPricePerQuantity !== undefined
                ? String(product.buyingPricePerQuantity)
                : "",
            totalStock:
              product.totalStock !== undefined
                ? String(product.totalStock)
                : "",
            alertThreshold:
              product.alertThreshold !== undefined
                ? String(product.alertThreshold)
                : "",
          });
        });
    }
  }, [productId, formFor, storeId]);

  function handleFormData(key: keyof typeof formData, value: any) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const handleSelectedImageChange = (images: ProductImageType[]) => {
    setSelectedImages(images);
    handleFormData(
      "imageIds",
      images.map((img) => img.imageId),
    );
  };

  const handleSelectedCategoryChange = (categories: CategoryDto[]) => {
    setSelectedCategories(categories);
    handleFormData(
      "categoryIds",
      categories.map((c) => c.id),
    );
  };

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

  const groupUnitOptions: SelectOptionType[] = [
    ...formData.unitGroups.map((ug: UnitGroupType) => ({
      key: ug.unit,
      value: convertUnit(ug.unit, storeSettings.customUnits),
    })),
    {
      key: formData.stockUnit,
      value: convertUnit(formData.stockUnit, storeSettings.customUnits),
    },
  ];

  const isSubmitting = createStatus === "loading" || updateStatus === "loading";
  const isLoading =
    getStatus === "loading" ||
    createStatus === "loading" ||
    updateStatus === "loading";

  useEffect(() => {
    setActionButtons(
      <NavActionButton
        onClick={handleSaveProduct}
        disabled={isSubmitting || isLoading}
        loading={isSubmitting}
      >
        <CloudCheck size={17} />
        Save Product
      </NavActionButton>,
    );
  }, [setActionButtons, isLoading, isSubmitting, formData]);

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

      <Separator text={"Product images"} className="mb-8 mt-10" />

      <div>
        <Label className="flex items-center gap-3" htmlFor="">
          <p>Add product images</p>
          <IconTooltip
            icon={<Info size={15} />}
            tooltip={descriptiveTooltip.PRODUCT_IMAGE}
          />
        </Label>
        <ProductImageSection
          selectedImages={selectedImages}
          onImageChange={handleSelectedImageChange}
          storeId={storeId}
          productId={productId as string}
          rearrangeAllowed={formFor === "edit"}
        />
      </div>

      <Separator text={"Categories"} className="mb-8 mt-10" />

      <div>
        <Label htmlFor="category" className="block text-gray-600 mb-1.5">
          Select categories
        </Label>
        <CategorySelector
          value={selectedCategories}
          onChange={handleSelectedCategoryChange}
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
            Buying price ({currencySymbol})
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

      <Separator text={"Unit Groups"} className="mb-8 mt-10" />

      <div>
        <Label className="flex items-center gap-3 mb-3">
          <p>Unit groups (optional)</p>
          <IconTooltip
            icon={<Info size={15} />}
            tooltip={descriptiveTooltip.UNIT_GROUPS}
          />
        </Label>
        <UnitGroupsSection
          baseUnit={formData.stockUnit}
          value={formData.unitGroups}
          onChange={(groups) => handleFormData("unitGroups", groups)}
          disabled={isLoading}
        />
      </div>

      <Separator text={"Inventory tracking"} className="mb-8 mt-10" />

      <div className="space-y-4">
        {/* Toggle Inventory Tracking */}
        <div className="flex items-center gap-6 mb-3">
          <Label
            className="flex items-center gap-3 mb-0"
            htmlFor="enable-tracking"
          >
            <p>Enable Inventory tracking</p>
            <IconTooltip
              icon={<Info size={15} />}
              tooltip={descriptiveTooltip.STOCK_TRACKING}
            />
          </Label>
          <ToggleButton
            id="enable-tracking"
            isActive={formData.trackInventory}
            onChange={(e) => {
              handleFormData("trackInventory", e);
              if (
                e &&
                (!formData.alertThreshold || formData.alertThreshold === 0) &&
                formData.totalStock > 0
              ) {
                const defaultThreshold =
                  Math.round(formData.totalStock * 0.1 * 100) / 100;
                handleFormData("alertThreshold", defaultThreshold);
                setLocalInputs((prev) => ({
                  ...prev,
                  alertThreshold: String(defaultThreshold),
                }));
              }
            }}
            disabled={isLoading}
          />
        </div>

        {/* Inventory details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label
              htmlFor="stock"
              className="block text-gray-600 mb-1.5"
              required={formData.trackInventory}
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
              disabled={!formData.trackInventory || isLoading}
            />
          </div>

          <div>
            <Label
              htmlFor="alert-threshold"
              className="block text-gray-600 mb-1.5"
            >
              Low Stock Alert Threshold
            </Label>
            <StockInput
              type="number"
              id="alert-threshold"
              placeholder="Enter threshold"
              value={localInputs.alertThreshold}
              unit={formData.stockUnit}
              onChange={(e) => {
                handleNumberChange("alertThreshold", e);
                if (formFor === "create") {
                  const num = parseFloat(e);
                  if (!isNaN(num) && num > 0) {
                    handleFormData("emailAlert", true);
                  } else {
                    handleFormData("emailAlert", false);
                  }
                }
              }}
              disabled={!formData.trackInventory || isLoading}
            />
          </div>
        </div>

        {/* Email Alert Toggle */}
        <div className="flex items-center gap-6 pt-2">
          <Label className="flex items-center gap-3 mb-0" htmlFor="email-alert">
            <p>Enable Email Alerts</p>
            <IconTooltip
              icon={<Info size={15} />}
              tooltip={descriptiveTooltip.EMAIL_ALERT}
            />
          </Label>
          <ToggleButton
            id="email-alert"
            isActive={formData.emailAlert}
            onChange={(e) => handleFormData("emailAlert", e)}
            disabled={!formData.trackInventory || isLoading}
          />
        </div>
      </div>

      <Separator text={"Selling price"} className="mb-8 mt-10" />

      <div>
        <Label
          className="flex items-center gap-3"
          htmlFor="price-breakdown"
          required
        >
          <p>Add price per quantity (Selling prices)</p>
          <IconTooltip
            icon={<Info size={15} />}
            tooltip={descriptiveTooltip.PRICE_PER_QUANTITY}
          />
        </Label>
        <div>
          <PriceBreakdownInput
            value={formData.pricePerQuantity}
            onChange={(e) => handleFormData("pricePerQuantity", e)}
            baseUnit={formData.stockUnit}
            buyingPricePerItem={formData.buyingPricePerQuantity}
            unitOptions={groupUnitOptions}
            unitGroups={formData.unitGroups}
          />
        </div>
      </div>

      <div className="mt-10 flex items-center gap-3 justify-end">
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
