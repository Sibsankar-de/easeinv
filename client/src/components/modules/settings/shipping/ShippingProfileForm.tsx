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
  ShippingProfileCreateDto,
  ShippingProfileUpdateDto,
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

  const isSaving =
    createStatus === "loading" || updateStatus === "loading";

  const [name, setName] = useState(profile?.name || "");
  const [description, setDescription] = useState(
    profile?.description || "",
  );
  const [isActive, setIsActive] = useState(profile?.isActive ?? true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEditing && !propInitialData && routeProfileId && storeId) {
      dispatch(
        fetchShippingProfileByIdThunk({ storeId, profileId: routeProfileId }),
      );
    }
  }, [isEditing, propInitialData, routeProfileId, storeId, dispatch]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setDescription(profile.description || "");
      setIsActive(profile.isActive);
    }
  }, [profile]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      newErrors.name = "Profile name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && activeProfileId) {
      const payload: ShippingProfileUpdateDto = {
        name: name.trim(),
        description: description.trim() || null,
        isActive,
      };

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
      const payload: ShippingProfileCreateDto = {
        name: name.trim(),
        description: description.trim() || null,
        isActive,
      };

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
          {isEditing ? "Edit Shipping Profile" : "Create Shipping Profile"}
        </h1>
        <p className="text-sm text-gray-600">
          {isEditing
            ? "Update your shipping profile details, description, and status."
            : "Define a new shipping profile to configure delivery zones and custom rate rules."}
        </p>
      </div>

      <Card>
        <CardHeader
          icon={<Truck className="w-5 h-5 text-primary" />}
          title={isEditing ? "Profile Details" : "General Information"}
        />

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label required>Profile Name</Label>
              <Input
                placeholder="e.g. Standard Delivery, Express Shipping, Heavy Freight"
                value={name}
                onChange={(val) => {
                  setName(val);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Provide notes or explain which orders/products this shipping profile covers..."
                value={description}
                onChange={(val) => setDescription(val)}
                disabled={isSaving}
                rows={3}
              />
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <LineToggle
                id="shipping-profile-active-toggle"
                title="Enable Profile"
                subTitle="When enabled, orders can calculate delivery fees using this shipping profile"
                toggleProps={{
                  isActive,
                  onChange: setIsActive,
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
              {isEditing ? "Save Changes" : "Create Profile"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
