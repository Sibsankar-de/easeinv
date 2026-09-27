"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { ToggleButton } from "@/components/ui/ToggleButton";
import { DateInput } from "@/components/ui/DateInput";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { Separator } from "@/components/ui/Separator";
import { CategorySelector } from "@/components/modules/inventory/CategorySelector";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { useNavContext } from "@/contexts/NavContext";
import { NavActionButton } from "../navbar/Navbar";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import {
  createCouponThunk,
  getCouponDetailsThunk,
  updateCouponThunk,
  invalidateCouponPages,
  selectCouponState,
} from "@/store/features/couponSlice";
import { CouponCreateUpdateDto, CouponDto } from "@/types/dto/couponDto";
import { CategoryDto } from "@/types/dto/categoryDto";
import { toast } from "@/utils/toast";
import {
  CloudCheck,
  Percent,
  DollarSign,
  Tag,
  Calendar,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { fetchCategoriesThunk } from "@/store/features/inventorySlice";
import { AppDispatch } from "@/store/store";

import { Card, CardHeader } from "@/components/ui/Card";

export const CouponForm = ({ formFor }: { formFor: "create" | "edit" }) => {
  const params = useParams();
  const storeId = params?.store_id as string;
  const couponId = params?.coupon_id as string;

  const dispatch = useDispatch<AppDispatch>();
  const { navigate } = useStoreNavigation();
  const { setActionButtons } = useNavContext();

  const { getStatus, createStatus, updateStatus } =
    useSelector(selectCouponState);
  const {
    data: { currencySymbol },
  } = useSelector(selectCurrentStoreState);

  // Form State
  const [formData, setFormData] = useState<CouponCreateUpdateDto>({
    name: "",
    code: "",
    description: "",
    discountType: "PERCENT",
    discountValue: 0,
    maxDiscount: undefined,
    minOrderValue: undefined,
    usageLimit: undefined,
    perCustomerLimit: undefined,
    isActive: true,
    startsAt: null,
    endsAt: null,
    categoryIds: [],
    useAllCategories: false,
  });

  const [selectedCategories, setSelectedCategories] = useState<CategoryDto[]>(
    [],
  );

  // Local string inputs for numeric fields to ensure smooth typing
  const [localInputs, setLocalInputs] = useState({
    discountValue: "",
    maxDiscount: "",
    minOrderValue: "",
    usageLimit: "",
    perCustomerLimit: "",
  });

  // Fetch store categories if not loaded
  useEffect(() => {
    if (storeId) {
      dispatch(fetchCategoriesThunk(storeId));
    }
  }, [storeId, dispatch]);

  // Load existing coupon data in edit mode
  useEffect(() => {
    if (formFor === "edit" && couponId && storeId) {
      dispatch(getCouponDetailsThunk({ storeId, couponId }))
        .unwrap()
        .then((coupon: CouponDto) => {
          const cats = coupon.categories || [];
          setFormData({
            name: coupon.name,
            code: coupon.code,
            description: coupon.description || "",
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            maxDiscount: coupon.maxDiscount ?? undefined,
            minOrderValue: coupon.minOrderValue ?? undefined,
            usageLimit: coupon.usageLimit ?? undefined,
            perCustomerLimit: coupon.perCustomerLimit ?? undefined,
            isActive: coupon.isActive,
            startsAt: coupon.startsAt ? coupon.startsAt.split("T")[0] : null,
            endsAt: coupon.endsAt ? coupon.endsAt.split("T")[0] : null,
            categoryIds: cats.map((c) => c.id),
            useAllCategories: cats.length === 0,
          });

          setSelectedCategories(cats);

          setLocalInputs({
            discountValue:
              coupon.discountValue !== undefined
                ? String(coupon.discountValue)
                : "",
            maxDiscount:
              coupon.maxDiscount !== undefined && coupon.maxDiscount !== null
                ? String(coupon.maxDiscount)
                : "",
            minOrderValue:
              coupon.minOrderValue !== undefined &&
              coupon.minOrderValue !== null
                ? String(coupon.minOrderValue)
                : "",
            usageLimit:
              coupon.usageLimit !== undefined && coupon.usageLimit !== null
                ? String(coupon.usageLimit)
                : "",
            perCustomerLimit:
              coupon.perCustomerLimit !== undefined &&
              coupon.perCustomerLimit !== null
                ? String(coupon.perCustomerLimit)
                : "",
          });
        })
        .catch(() => {
          toast.error("Failed to load coupon details");
          navigate("/coupons");
        });
    }
  }, [formFor, couponId, storeId, dispatch, navigate]);

  const handleFieldChange = <K extends keyof CouponCreateUpdateDto>(
    key: K,
    value: CouponCreateUpdateDto[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
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
    const safeValue = isNaN(numValue) ? undefined : numValue;

    handleFieldChange(key as keyof CouponCreateUpdateDto, safeValue);
  };

  const handleSelectedCategoryChange = (categories: CategoryDto[]) => {
    setSelectedCategories(categories);
    handleFieldChange(
      "categoryIds",
      categories.map((c) => c.id),
    );
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.warn("Please enter a coupon name");
      return false;
    }
    if (!formData.code.trim()) {
      toast.warn("Please enter a coupon code");
      return false;
    }
    if (formData.discountValue <= 0) {
      toast.warn("Discount value must be greater than 0");
      return false;
    }
    if (formData.discountType === "PERCENT" && formData.discountValue > 100) {
      toast.warn("Percentage discount cannot exceed 100%");
      return false;
    }
    if (
      formData.startsAt &&
      formData.endsAt &&
      formData.endsAt < formData.startsAt
    ) {
      toast.warn("End date must be after or equal to start date");
      return false;
    }
    return true;
  };

  const handleSaveCoupon = async () => {
    if (!validateForm() || !storeId) return;

    const payload: CouponCreateUpdateDto = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      categoryIds: formData.useAllCategories ? [] : formData.categoryIds,
    };

    if (formFor === "create") {
      await dispatch(createCouponThunk({ storeId, data: payload }))
        .unwrap()
        .then(() => {
          toast.success("Coupon created successfully!");
          dispatch(invalidateCouponPages());
          navigate("/coupons");
        });
    } else {
      await dispatch(updateCouponThunk({ storeId, couponId, data: payload }))
        .unwrap()
        .then(() => {
          toast.success("Coupon updated successfully!");
          dispatch(invalidateCouponPages());
          navigate("/coupons");
        });
    }
  };

  const isSubmitting = createStatus === "loading" || updateStatus === "loading";
  const isLoading = getStatus === "loading" || isSubmitting;

  useEffect(() => {
    setActionButtons(
      <NavActionButton
        onClick={handleSaveCoupon}
        disabled={isSubmitting || isLoading}
        loading={isSubmitting}
      >
        <CloudCheck size={17} />
        {formFor === "create" ? "Create Coupon" : "Save Changes"}
      </NavActionButton>,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setActionButtons, isLoading, isSubmitting, formData, formFor]);

  if (formFor === "edit" && getStatus === "loading") {
    return <FormSkeleton rows={6} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Basic Information */}
      <Card>
        <CardHeader
          icon={<Tag className="w-5 h-5 text-indigo-600" />}
          title="Basic Details"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label
              htmlFor="name"
              className="block text-gray-700 mb-1.5"
              required
            >
              Coupon Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Summer Festival Special"
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label
              htmlFor="code"
              className="block text-gray-700 mb-1.5"
              required
            >
              Coupon Code
            </Label>
            <Input
              id="code"
              placeholder="e.g. SUMMER50"
              value={formData.code}
              onChange={(e) => handleFieldChange("code", e.toUpperCase())}
              disabled={isLoading}
              className="uppercase font-mono"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="block text-gray-700 mb-1.5">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Brief explanation of when and how this coupon applies..."
            value={formData.description || ""}
            onChange={(e) => handleFieldChange("description", e)}
            disabled={isLoading}
            rows={2}
          />
        </div>
      </Card>

      {/* 2. Discount Configuration */}
      <Card>
        <CardHeader
          icon={<Percent className="w-5 h-5 text-indigo-600" />}
          title="Discount Configuration"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <Label className="block text-gray-700 mb-1.5" required>
              Discount Type
            </Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
              <Button
                type="button"
                variant={
                  formData.discountType === "PERCENT" ? "primary" : "none"
                }
                className={`py-2 text-xs font-semibold justify-center transition-all ${
                  formData.discountType === "PERCENT"
                    ? "shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => handleFieldChange("discountType", "PERCENT")}
                disabled={isLoading}
              >
                <Percent className="w-3.5 h-3.5 mr-1" />
                Percentage (%)
              </Button>
              <Button
                type="button"
                variant={formData.discountType === "FIXED" ? "primary" : "none"}
                className={`py-2 text-xs font-semibold justify-center transition-all ${
                  formData.discountType === "FIXED"
                    ? "shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => handleFieldChange("discountType", "FIXED")}
                disabled={isLoading}
              >
                <DollarSign className="w-3.5 h-3.5 mr-1" />
                Fixed ({currencySymbol})
              </Button>
            </div>
          </div>

          <div>
            <Label
              htmlFor="discountValue"
              className="block text-gray-700 mb-1.5"
              required
            >
              {formData.discountType === "PERCENT"
                ? "Discount Percentage"
                : "Discount Amount"}
            </Label>
            <Input
              id="discountValue"
              type="number"
              min="0"
              max={formData.discountType === "PERCENT" ? "100" : undefined}
              step="any"
              placeholder={
                formData.discountType === "PERCENT" ? "e.g. 20" : "e.g. 50"
              }
              value={localInputs.discountValue}
              onChange={(e) => handleNumberChange("discountValue", e)}
              disabled={isLoading}
            />
          </div>

          {formData.discountType === "PERCENT" && (
            <div>
              <Label
                htmlFor="maxDiscount"
                className="block text-gray-700 mb-1.5"
              >
                Maximum Discount Cap ({currencySymbol})
              </Label>
              <Input
                id="maxDiscount"
                type="number"
                min="0"
                step="any"
                placeholder="Optional (e.g. 100)"
                value={localInputs.maxDiscount}
                onChange={(e) => handleNumberChange("maxDiscount", e)}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </Card>

      {/* 3. Order & Usage Rules */}
      <Card>
        <CardHeader
          icon={<ShieldCheck className="w-5 h-5 text-indigo-600" />}
          title="Order & Usage Rules"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <Label
              htmlFor="minOrderValue"
              className="block text-gray-700 mb-1.5"
            >
              Minimum Order Value ({currencySymbol})
            </Label>
            <Input
              id="minOrderValue"
              type="number"
              min="0"
              step="any"
              placeholder="0 (No minimum)"
              value={localInputs.minOrderValue}
              onChange={(e) => handleNumberChange("minOrderValue", e)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="usageLimit" className="block text-gray-700 mb-1.5">
              Total Usage Limit
            </Label>
            <Input
              id="usageLimit"
              type="number"
              min="1"
              step="1"
              placeholder="Unlimited"
              value={localInputs.usageLimit}
              onChange={(e) => handleNumberChange("usageLimit", e)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label
              htmlFor="perCustomerLimit"
              className="block text-gray-700 mb-1.5"
            >
              Per Customer Limit
            </Label>
            <Input
              id="perCustomerLimit"
              type="number"
              min="1"
              step="1"
              placeholder="Unlimited"
              value={localInputs.perCustomerLimit}
              onChange={(e) => handleNumberChange("perCustomerLimit", e)}
              disabled={isLoading}
            />
          </div>
        </div>
      </Card>

      {/* 4. Category Applicability */}
      <Card>
        <CardHeader
          icon={<Layers className="w-5 h-5 text-indigo-600" />}
          title="Applicable Categories"
        />

        <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <span className="font-medium text-gray-900 block text-sm">
              Apply to All Categories
            </span>
            <span className="text-gray-500 text-xs">
              When enabled, this coupon will be applicable to all items across
              every category in the store.
            </span>
          </div>
          <ToggleButton
            isActive={formData.useAllCategories ?? false}
            onChange={(checked) =>
              handleFieldChange("useAllCategories", checked)
            }
            disabled={isLoading}
          />
        </div>

        {!formData.useAllCategories && (
          <div className="space-y-2 pt-1">
            <Label className="block text-gray-700 text-sm">
              Select Applicable Categories
            </Label>
            <CategorySelector
              value={selectedCategories}
              onChange={handleSelectedCategoryChange}
            />
          </div>
        )}
      </Card>

      {/* 5. Schedule & Active Status */}
      <Card>
        <CardHeader
          icon={<Calendar className="w-5 h-5 text-indigo-600" />}
          title="Schedule & Status"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="startsAt" className="block text-gray-700 mb-1.5">
              Start Date
            </Label>
            <DateInput
              value={formData.startsAt || ""}
              onChange={(date) => handleFieldChange("startsAt", date || null)}
              placeholder="Select start date"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="endsAt" className="block text-gray-700 mb-1.5">
              End Date (Expiry)
            </Label>
            <DateInput
              value={formData.endsAt || ""}
              onChange={(date) => handleFieldChange("endsAt", date || null)}
              placeholder="Select end date"
              disabled={isLoading}
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="font-medium text-gray-900 block text-sm">
              Coupon Active Status
            </span>
            <span className="text-gray-500 text-xs">
              Deactivating will immediately prevent customers from redeeming
              this coupon.
            </span>
          </div>
          <ToggleButton
            isActive={formData.isActive ?? true}
            onChange={(checked) => handleFieldChange("isActive", checked)}
            disabled={isLoading}
          />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/coupons")}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSaveCoupon}
          disabled={isSubmitting || isLoading}
          loading={isSubmitting}
          className="gap-2"
        >
          <CloudCheck size={18} />
          {formFor === "create" ? "Create Coupon" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
