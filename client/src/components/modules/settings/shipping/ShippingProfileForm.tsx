"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { LineToggle } from "@/components/ui/LineToggle";
import {
  ShippingProfileDto,
  ShippingProfileCreateUpdateDto,
} from "@/types/dto/shippingProfileDto";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  createShippingProfileThunk,
  updateShippingProfileThunk,
  fetchShippingProfileByIdThunk,
  invalidateShippingProfilePages,
  selectShippingProfileState,
} from "@/store/features/shippingProfileSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { toast } from "@/utils/toast";
import { ArrowLeft, Truck } from "lucide-react";
import { FormSkeleton } from "@/components/ui/Skeleton";

interface ShippingProfileFormProps {
  initialData?: ShippingProfileDto | null;
  isEditing?: boolean;
}

interface ShippingProfileFormData {
  name: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  fallbackRate: number | string;
}

const initialFormData: ShippingProfileFormData = {
  name: "",
  description: "",
  isDefault: false,
  isActive: true,
  fallbackRate: 0,
};

const getFormTitle = (isEditing: boolean) =>
  isEditing ? "Edit Shipping Profile" : "Create Shipping Profile";

const getFormDescription = (isEditing: boolean) =>
  isEditing
    ? "Update your shipping profile details, description, and status."
    : "Define a new shipping profile to configure delivery zones and custom rate rules.";

const getCardTitle = (isEditing: boolean) =>
  isEditing ? "Profile Details" : "General Information";

const getSubmitButtonLabel = (isEditing: boolean) =>
  isEditing ? "Save Changes" : "Create Profile";

export const ShippingProfileForm: React.FC<ShippingProfileFormProps> = ({
  initialData: propInitialData,
  isEditing = false,
}) => {
  const params = useParams();
  const routeProfileId = params?.profile_id as string | undefined;
  const { storeId, navigate } = useStoreNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: { currentProfile },
    getStatus,
    createStatus,
    updateStatus,
  } = useSelector(selectShippingProfileState);

  const profile = propInitialData || (isEditing ? currentProfile : null);
  const activeProfileId = profile?.id || routeProfileId;

  const isSaving = createStatus === "loading" || updateStatus === "loading";

  const [formData, setFormData] = useState<ShippingProfileFormData>(() => ({
    name: profile?.name || "",
    description: profile?.description || "",
    isDefault: profile?.isDefault ?? false,
    isActive: profile?.isActive ?? true,
    fallbackRate: profile?.fallbackRate ?? 0,
  }));
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = <K extends keyof ShippingProfileFormData>(
    field: K,
    value: ShippingProfileFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  useEffect(() => {
    if (isEditing && !propInitialData && routeProfileId && storeId) {
      dispatch(
        fetchShippingProfileByIdThunk({ storeId, profileId: routeProfileId }),
      );
    }
  }, [isEditing, propInitialData, routeProfileId, storeId, dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        description: profile.description || "",
        isDefault: profile.isDefault,
        isActive: profile.isActive,
        fallbackRate: profile.fallbackRate ?? 0,
      });
    }
  }, [profile]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Profile name is required";
    }
    if (
      formData.fallbackRate !== "" &&
      (isNaN(Number(formData.fallbackRate)) ||
        Number(formData.fallbackRate) < 0)
    ) {
      newErrors.fallbackRate = "Fallback rate must be non-negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: ShippingProfileCreateUpdateDto = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      isDefault: formData.isDefault,
      isActive: formData.isActive,
      fallbackRate: Number(formData.fallbackRate) || 0,
    };

    if (isEditing && activeProfileId) {
      dispatch(
        updateShippingProfileThunk({
          storeId,
          profileId: activeProfileId,
          data: payload,
        }),
      )
        .unwrap()
        .then((updated) => {
          toast.success("Shipping profile updated successfully.");
          dispatch(invalidateShippingProfilePages());
          navigate(`/settings/shipping/${updated.id}`);
        })
        .catch((err: any) => {
          toast.error(
            err?.data?.message || "Failed to update shipping profile",
          );
        });
    } else {
      dispatch(
        createShippingProfileThunk({
          storeId,
          data: payload,
        }),
      )
        .unwrap()
        .then((created) => {
          toast.success("Shipping profile created successfully.");
          dispatch(invalidateShippingProfilePages());
          navigate(`/settings/shipping/${created.id}`);
        })
        .catch((err: any) => {
          toast.error(
            err?.data?.message || "Failed to create shipping profile",
          );
        });
    }
  };

  if (isEditing && getStatus === "loading" && !profile) {
    return (
      <div className="space-y-6 w-full">
        <div>
          <Link
            href={
              routeProfileId
                ? `/stores/${storeId}/settings/shipping/${routeProfileId}`
                : `/stores/${storeId}/settings/shipping`
            }
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Profile Details
          </Link>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Edit Shipping Profile
          </h1>
          <p className="text-sm text-gray-600">
            Update your shipping profile details, description, and status.
          </p>
        </div>
        <FormSkeleton rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Top Back Link */}
      <div>
        <Link
          href={
            isEditing && activeProfileId
              ? `/stores/${storeId}/settings/shipping/${activeProfileId}`
              : `/stores/${storeId}/settings/shipping`
          }
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {isEditing ? "Back to Profile Details" : "Back to Shipping Profiles"}
        </Link>
      </div>

      {/* Page Title & Description */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          {getFormTitle(isEditing)}
        </h1>
        <p className="text-sm text-gray-600">{getFormDescription(isEditing)}</p>
      </div>

      <Card>
        <CardHeader
          icon={<Truck className="w-5 h-5 text-primary" />}
          title={getCardTitle(isEditing)}
        />

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label required>Profile Name</Label>
              <Input
                placeholder="e.g. Standard Delivery, Express Shipping, Heavy Freight"
                value={formData.name}
                onChange={(val) => handleInputChange("name", val)}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Provide notes or explain which orders/products this shipping profile covers..."
                value={formData.description}
                onChange={(val) => handleInputChange("description", val)}
                disabled={isSaving}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Fallback Rate (₹)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.fallbackRate}
                onChange={(val) => handleInputChange("fallbackRate", val)}
                isInvalid={!!errors.fallbackRate}
                errorMessage={errors.fallbackRate}
                disabled={isSaving}
              />
              <p className="text-xs text-gray-500">
                Default rate used when no specific shipping zone or rule
                matches.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
              <LineToggle
                id="shipping-profile-default-toggle"
                title="Default Profile"
                subTitle="Set as the default shipping profile for your store"
                toggleProps={{
                  isActive: formData.isDefault,
                  onChange: (val) => handleInputChange("isDefault", val),
                  disabled: isSaving,
                }}
              />
              <LineToggle
                id="shipping-profile-active-toggle"
                title="Enable Profile"
                subTitle="When enabled, orders can calculate delivery fees using this shipping profile"
                toggleProps={{
                  isActive: formData.isActive,
                  onChange: (val) => handleInputChange("isActive", val),
                  disabled: isSaving,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(
                  isEditing && activeProfileId
                    ? `/settings/shipping/${activeProfileId}`
                    : "/settings/shipping",
                )
              }
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} loading={isSaving}>
              {getSubmitButtonLabel(isEditing)}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
