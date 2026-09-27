"use client";

import { Input } from "../../ui/Input";
import { Textarea } from "../../ui/Textarea";
import { Label } from "../../ui/Label";
import { CategorySelector } from "./CategorySelector";
import { StockUnitInput } from "../../ui/StockUnitInput";
import { PriceBreakdownInput } from "./PriceBreakdownInput";
import { Button } from "../../ui/Button";
import {
  CloudCheck,
  Info,
  Package,
  ArrowLeft,
  Image as ImageIcon,
  Layers,
  Coins,
  Boxes,
  ShieldCheck,
  Receipt,
} from "lucide-react";
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
  invalidateProductPages,
} from "@/store/features/inventorySlice";
import { useParams } from "next/navigation";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { toast } from "@/utils/toast";
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
import { formatDateStr } from "@/utils/formatDate";
import { PriceInput } from "@/components/ui/PriceInput";
import { Card, CardHeader } from "@/components/ui/Card";
import { AppDispatch } from "@/store/store";

interface ProductFormData {
  name: string;
  sku: string;
  gtin: string;
  description: string;
  categoryIds: string[];
  buyingPricePerQuantity: number;
  mrp?: number;
  stockUnit: string;
  totalStock: number;
  trackInventory: boolean;
  alertThreshold: number;
  emailAlert: boolean;
  pricePerQuantity: PricePerQuantityType[];
  imageIds: string[];
  unitGroups: UnitGroupType[];
  lastStockAddedAt?: Date | string | null;
  lastStockAmount?: number | null;
}

export const ProductForm = ({ formFor }: { formFor: string }) => {
  const router = useRouter();
  const params = useParams();
  const storeId = params?.store_id as string;
  const productId = params?.product_id as string;
  const dispatch = useDispatch<AppDispatch>();
  const { getStatus, createStatus, updateStatus } =
    useSelector(selectInventoryState);
  const {
    data: { storeSettings, currencySymbol },
  } = useSelector(selectCurrentStoreState);
  const { navigate } = useStoreNavigation();
  const { setActionButtons } = useNavContext();

  // Data state (Numeric values for backend)
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    gtin: "",
    description: "",
    categoryIds: [],
    buyingPricePerQuantity: 0,
    mrp: undefined,
    stockUnit: unitMap[0].key,
    totalStock: 0,
    trackInventory: false,
    alertThreshold: 0,
    emailAlert: false,
    pricePerQuantity: [],
    imageIds: [],
    unitGroups: [],
  });

  const [selectedImages, setSelectedImages] = useState<ProductImageType[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryDto[]>(
    [],
  );

  // UI State (String values for Inputs)
  const [localInputs, setLocalInputs] = useState({
    buyingPricePerQuantity: "",
    mrp: "",
    totalStock: "",
    alertThreshold: "",
  });

  useEffect(() => {
    if (formFor === "edit" && productId) {
      dispatch(getProductDetailsThunk({ productId, storeId }))
        .unwrap()
        .then((product: ProductDto) => {
          const cats = product.categories || [];
          setFormData({
            name: product.name,
            sku: product.sku,
            gtin: product.gtin || "",
            description: product.description || "",
            categoryIds: cats.map((c) => c.id),
            buyingPricePerQuantity: product.buyingPricePerQuantity,
            mrp: product.mrp ?? undefined,
            stockUnit: product.stockUnit,
            totalStock: product.totalStock ?? 0,
            trackInventory: Boolean(product.trackInventory),
            alertThreshold: product.alertThreshold ?? 0,
            emailAlert: Boolean(product.emailAlert),
            pricePerQuantity: product.pricePerQuantity || [],
            imageIds:
              product.images?.map(
                (img: ProductImageType) => img.id || img.imageId,
              ) || [],
            unitGroups: product.unitGroups || [],
            lastStockAddedAt: product.lastStockAddedAt ?? null,
            lastStockAmount: product.lastStockAmount,
          });
          setSelectedImages(product.images || []);
          setSelectedCategories(cats);

          setLocalInputs({
            buyingPricePerQuantity:
              product.buyingPricePerQuantity !== undefined
                ? String(product.buyingPricePerQuantity)
                : "",
            mrp:
              product.mrp !== undefined && product.mrp !== null
                ? String(product.mrp)
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
  }, [productId, formFor, storeId, dispatch]);

  function handleFormData<K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K],
  ) {
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

  const handleNumberChange = (
    key: keyof typeof localInputs,
    rawValue: string,
  ) => {
    setLocalInputs((prev) => ({
      ...prev,
      [key]: rawValue,
    }));

    const numValue = parseFloat(rawValue);
    const safeValue = isNaN(numValue)
      ? key === "mrp"
        ? undefined
        : 0
      : numValue;

    setFormData((prev) => ({
      ...prev,
      [key]: safeValue,
    }));
  };

  const handleCreateProduct = async () => {
    if (!formData || !storeId) return;
    await dispatch(addNewProductThunk({ ...formData, storeId }))
      .unwrap()
      .then(() => {
        toast.success("Product created");
        dispatch(invalidateProductPages());
        navigate(`/inventory`);
      });
  };

  const handleUpdateProduct = async () => {
    if (!formData || !storeId) return;
    await dispatch(updateProductThunk({ ...formData, productId, storeId }))
      .unwrap()
      .then(() => {
        toast.success("Product saved.");
        dispatch(invalidateProductPages());
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setActionButtons, isLoading, isSubmitting, formData]);

  if (getStatus === "loading") {
    return <FormSkeleton rows={6} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Basic Details */}
      <Card>
        <CardHeader
          icon={<Package className="w-5 h-5 text-indigo-600" />}
          title="Basic Details"
        />

        <div className="space-y-5">
          <div>
            <Label
              htmlFor="name"
              className="block text-gray-700 mb-1.5"
              required
            >
              Product Name
            </Label>
            <Input
              placeholder="Enter product name"
              id="name"
              value={formData.name}
              onChange={(e) => handleFormData("name", e)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label
                htmlFor="sku"
                className="block text-gray-700 mb-1.5"
                required
              >
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
            <div>
              <Label htmlFor="gtin" className="block text-gray-700 mb-1.5">
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
            <Label htmlFor="description" className="block text-gray-700 mb-1.5">
              Product Description
            </Label>
            <Textarea
              placeholder="Write product description..."
              id="description"
              value={formData.description}
              onChange={(e) => handleFormData("description", e)}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* 2. Product Images */}
      <Card>
        <CardHeader
          icon={<ImageIcon className="w-5 h-5 text-indigo-600" />}
          title={
            <div className="flex items-center gap-2">
              <span>Product Images</span>
              <IconTooltip
                icon={<Info size={15} />}
                tooltip={descriptiveTooltip.PRODUCT_IMAGE}
              />
            </div>
          }
        />

        <div>
          <ProductImageSection
            selectedImages={selectedImages}
            onImageChange={handleSelectedImageChange}
            storeId={storeId}
            productId={productId as string}
            rearrangeAllowed={formFor === "edit"}
          />
        </div>
      </Card>

      {/* 3. Categories */}
      <Card>
        <CardHeader
          icon={<Layers className="w-5 h-5 text-indigo-600" />}
          title="Categories"
        />

        <div>
          <CategorySelector
            value={selectedCategories}
            onChange={handleSelectedCategoryChange}
          />
        </div>
      </Card>

      {/* 4. Buying Price & Base Unit */}
      <Card>
        <CardHeader
          icon={<Coins className="w-5 h-5 text-indigo-600" />}
          title="Pricing & Base Unit"
        />

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label
                htmlFor="price"
                className="block text-gray-700 mb-1.5"
                required
              >
                Buying Price ({currencySymbol})
              </Label>
              <PriceInput
                placeholder="Enter price for 1 unit"
                id="price"
                value={localInputs.buyingPricePerQuantity}
                onChange={(e) =>
                  handleNumberChange("buyingPricePerQuantity", e)
                }
                disabled={isLoading}
              />
            </div>

            <div>
              <Label
                htmlFor="stock-unit"
                className="block text-gray-700 mb-1.5"
                required
              >
                Stock Base Unit
              </Label>
              <StockUnitInput
                id="stock-unit"
                value={formData.stockUnit}
                onChange={(e) => handleFormData("stockUnit", e)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="mrp" className="block text-gray-700 mb-1.5">
              Maximum Retail Price (MRP) ({currencySymbol})
            </Label>
            <PriceInput
              placeholder="Enter MRP (Optional)"
              id="mrp"
              value={localInputs.mrp}
              onChange={(e) => handleNumberChange("mrp", e)}
              disabled={isLoading}
            />
          </div>
        </div>
      </Card>

      {/* 5. Unit Groups */}
      <Card>
        <CardHeader
          icon={<Boxes className="w-5 h-5 text-indigo-600" />}
          title={
            <div className="flex items-center gap-2">
              <span>Unit Groups (Optional)</span>
              <IconTooltip
                icon={<Info size={15} />}
                tooltip={descriptiveTooltip.UNIT_GROUPS}
              />
            </div>
          }
        />

        <div>
          <UnitGroupsSection
            baseUnit={formData.stockUnit}
            value={formData.unitGroups}
            onChange={(groups) => handleFormData("unitGroups", groups)}
            disabled={isLoading}
          />
        </div>
      </Card>

      {/* 6. Inventory Tracking */}
      <Card>
        <CardHeader
          icon={<ShieldCheck className="w-5 h-5 text-indigo-600" />}
          title="Inventory Tracking"
        />

        <div className="space-y-5">
          {/* Toggle Inventory Tracking */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-900 text-sm">
                  Enable Inventory Tracking
                </span>
                <IconTooltip
                  icon={<Info size={15} />}
                  tooltip={descriptiveTooltip.STOCK_TRACKING}
                />
              </div>
              <span className="text-gray-500 text-xs block">
                Track stock levels and receive automatic low-stock
                notifications.
              </span>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label
                htmlFor="stock"
                className="block text-gray-700 mb-1.5"
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
              {formData.trackInventory && formData.lastStockAddedAt && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Last stock update: {formData.lastStockAmount}{" "}
                  {convertUnit(formData.stockUnit, storeSettings.customUnits)}{" "}
                  on {formatDateStr(formData.lastStockAddedAt).dateStr} at{" "}
                  {formatDateStr(formData.lastStockAddedAt).timeStr}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="alert-threshold"
                className="block text-gray-700 mb-1.5"
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

          <Separator />

          {/* Email Alert Toggle */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-900 text-sm">
                  Enable Email Alerts
                </span>
                <IconTooltip
                  icon={<Info size={15} />}
                  tooltip={descriptiveTooltip.EMAIL_ALERT}
                />
              </div>
              <span className="text-gray-500 text-xs block">
                Receive email alerts when stock falls below the threshold.
              </span>
            </div>
            <ToggleButton
              id="email-alert"
              isActive={formData.emailAlert}
              onChange={(e) => handleFormData("emailAlert", e)}
              disabled={!formData.trackInventory || isLoading}
            />
          </div>
        </div>
      </Card>

      {/* 7. Selling Prices */}
      <Card>
        <CardHeader
          icon={<Receipt className="w-5 h-5 text-indigo-600" />}
          title={
            <div className="flex items-center gap-2">
              <span>Selling Prices (Price per Quantity)</span>
              <IconTooltip
                icon={<Info size={15} />}
                tooltip={descriptiveTooltip.PRICE_PER_QUANTITY}
              />
            </div>
          }
        />

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
      </Card>

      {/* Bottom Actions */}
      <div className="flex items-center justify-end gap-3 pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSaveProduct}
          disabled={isLoading}
          loading={isSubmitting}
          className="gap-2"
        >
          <CloudCheck size={18} />
          {formFor === "create" ? "Create Product" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
