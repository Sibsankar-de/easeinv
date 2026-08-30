"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  fetchShippingProfileByIdThunk,
  selectShippingProfileState,
  clearCurrentShippingProfile,
} from "@/store/features/shippingProfileSlice";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ShippingRuleDto,
  ShippingZoneDto,
  ShippingZoneType,
} from "@/types/dto/shippingProfileDto";
import {
  ArrowLeft,
  Truck,
  Plus,
  Edit2,
  Trash2,
  Globe,
  DollarSign,
  Layers,
  MapPin,
  Map,
} from "lucide-react";
import { ShippingProfileDeleteModal } from "./modals/ShippingProfileDeleteModal";
import { ShippingZoneModal } from "./modals/ShippingZoneModal";
import { ShippingZoneDeleteModal } from "./modals/ShippingZoneDeleteModal";
import { ShippingRuleModal } from "./modals/ShippingRuleModal";
import { ShippingRuleDeleteModal } from "./modals/ShippingRuleDeleteModal";
import { FormSkeleton } from "@/components/ui/Skeleton";

interface ShippingProfileDetailsViewProps {
  profileId?: string;
}

export const ShippingProfileDetailsView: React.FC<
  ShippingProfileDetailsViewProps
> = ({ profileId: propProfileId }) => {
  const params = useParams();
  const profileId = propProfileId || (params?.profile_id as string);
  const { storeId, navigate } = useStoreNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: { currentProfile },
    getStatus,
  } = useSelector(selectShippingProfileState);

  // Modal states
  const [isDeleteProfileOpen, setIsDeleteProfileOpen] = useState(false);

  const [zoneModalState, setZoneModalState] = useState<{
    open: boolean;
    zone: ShippingZoneDto | null;
  }>({ open: false, zone: null });

  const [deleteZoneState, setDeleteZoneState] = useState<{
    open: boolean;
    zone: ShippingZoneDto | null;
  }>({ open: false, zone: null });

  const [ruleModalState, setRuleModalState] = useState<{
    open: boolean;
    profileId?: string | null;
    zoneId?: string | null;
    targetName?: string;
    rule: ShippingRuleDto | null;
  }>({ open: false, rule: null });

  const [deleteRuleState, setDeleteRuleState] = useState<{
    open: boolean;
    rule: ShippingRuleDto | null;
  }>({ open: false, rule: null });

  const loadProfile = () => {
    if (storeId && profileId) {
      dispatch(fetchShippingProfileByIdThunk({ storeId, profileId }));
    }
  };

  useEffect(() => {
    loadProfile();
    return () => {
      dispatch(clearCurrentShippingProfile());
    };
  }, [storeId, profileId]);

  if (getStatus === "loading" && !currentProfile) {
    return (
      <div className="space-y-6 max-w-5xl">
        <FormSkeleton rows={4} />
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-gray-500">Shipping profile not found.</p>
        <Button
          variant="outline"
          onClick={() => navigate("/settings/shipping")}
        >
          Back to Shipping Profiles
        </Button>
      </div>
    );
  }

  const profile = currentProfile;
  const totalZoneRules = profile.zones.reduce(
    (sum, z) => sum + (z.rules?.length || 0),
    0,
  );

  const getZoneTypeBadge = (type: ShippingZoneType) => {
    switch (type) {
      case ShippingZoneType.PINCODE:
        return (
          <Badge variant="info" className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>Pincode</span>
          </Badge>
        );
      case ShippingZoneType.STATE:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Map className="w-3 h-3" />
            <span>State</span>
          </Badge>
        );
      case ShippingZoneType.COUNTRY:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            <span>Country</span>
          </Badge>
        );
    }
  };

  const renderRulesTable = (
    rules: ShippingRuleDto[],
    targetZone?: ShippingZoneDto,
  ) => {
    if (!rules || rules.length === 0) {
      return (
        <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg text-sm text-gray-500">
          No rate rules defined yet.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-2.5 px-3">Condition Type</th>
              <th className="py-2.5 px-3">Range / Bracket</th>
              <th className="py-2.5 px-3">Shipping Fee</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rules.map((rule) => {
              const isPrice = rule.type === "PRICE";
              const rangeText = `${isPrice ? "₹" : ""}${rule.minValue} ${
                rule.maxValue !== null
                  ? `– ${isPrice ? "₹" : ""}${rule.maxValue}`
                  : "and above (∞)"
              }`;

              return (
                <tr key={rule.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-gray-900">
                    <Badge variant={isPrice ? "primary" : "secondary"}>
                      {isPrice ? "Order Subtotal" : "Weight Based"}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-gray-700">{rangeText}</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">
                    {rule.amount === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      `₹${rule.amount.toFixed(2)}`
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        className="p-1.5 text-gray-600 hover:text-gray-900"
                        tooltip="Edit Rule"
                        onClick={() =>
                          setRuleModalState({
                            open: true,
                            profileId: targetZone ? null : profile.id,
                            zoneId: targetZone ? targetZone.id : null,
                            targetName: targetZone ? targetZone.name : profile.name,
                            rule,
                          })
                        }
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="danger"
                        className="p-1.5"
                        tooltip="Delete Rule"
                        onClick={() =>
                          setDeleteRuleState({ open: true, rule })
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Link */}
      <div>
        <Link
          href={`/stores/${storeId}/settings/shipping`}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Shipping Profiles
        </Link>
      </div>

      {/* Profile Header Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-primary shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-gray-900">
                  {profile.name}
                </h1>
                <Badge variant={profile.isActive ? "success" : "outline"}>
                  {profile.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {profile.description && (
                <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                  {profile.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() =>
                navigate(`/settings/shipping/${profile.id}/edit`)
              }
              className="flex items-center gap-1.5"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
            <Button
              variant="danger"
              onClick={() => setIsDeleteProfileOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="p-3.5 bg-gray-50 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Delivery Zones</p>
              <p className="text-lg font-bold text-gray-900">
                {profile.zones.length}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Zone Specific Rules
              </p>
              <p className="text-lg font-bold text-gray-900">{totalZoneRules}</p>
            </div>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Default Rate Rules
              </p>
              <p className="text-lg font-bold text-gray-900">
                {profile.rules.length}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 1: General Rates */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <DollarSign className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-semibold">General Shipping Rates</h2>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                Standard rates applied when an order destination does not match a specific zone or zone rate bracket
              </p>
            </div>
          </div>

          <Button
            onClick={() =>
              setRuleModalState({
                open: true,
                profileId: profile.id,
                zoneId: null,
                targetName: profile.name,
                rule: null,
              })
            }
            className="flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Rate Rule</span>
          </Button>
        </div>

        <div className="pt-2">
          {renderRulesTable(profile.rules)}
        </div>
      </Card>

      {/* Section 2: Delivery Zones */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <Globe className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-semibold">Delivery Zones & Zone Rates</h2>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                Configure geographic zones by postal codes, state, or country with customized rate brackets
              </p>
            </div>
          </div>

          <Button
            onClick={() =>
              setZoneModalState({ open: true, zone: null })
            }
            className="flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Delivery Zone</span>
          </Button>
        </div>

        <div className="pt-2">
          {profile.zones.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl space-y-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  No Delivery Zones Added
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Add zones to target specific delivery postal codes, states, or
                  countries.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.zones.map((zone) => (
                <div
                  key={zone.id}
                  className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">
                        {zone.name}
                      </span>
                      {getZoneTypeBadge(zone.type)}
                      <span className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600 font-mono">
                        Code: {zone.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setRuleModalState({
                            open: true,
                            profileId: null,
                            zoneId: zone.id,
                            targetName: zone.name,
                            rule: null,
                          })
                        }
                        className="flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Rule</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setZoneModalState({ open: true, zone })
                        }
                        className="p-2"
                        tooltip="Edit Zone"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          setDeleteZoneState({ open: true, zone })
                        }
                        className="p-2"
                        tooltip="Delete Zone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Zone Rules List */}
                  <div className="pt-2">
                    {renderRulesTable(zone.rules || [], zone)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      <ShippingProfileDeleteModal
        openState={isDeleteProfileOpen}
        onClose={() => setIsDeleteProfileOpen(false)}
        profile={profile}
        onSuccess={() => navigate("/settings/shipping")}
      />

      <ShippingZoneModal
        openState={zoneModalState.open}
        onClose={() => setZoneModalState({ open: false, zone: null })}
        profileId={profile.id}
        zone={zoneModalState.zone}
        onSuccess={loadProfile}
      />

      <ShippingZoneDeleteModal
        openState={deleteZoneState.open}
        onClose={() => setDeleteZoneState({ open: false, zone: null })}
        zone={deleteZoneState.zone}
        onSuccess={loadProfile}
      />

      <ShippingRuleModal
        openState={ruleModalState.open}
        onClose={() =>
          setRuleModalState({
            open: false,
            profileId: null,
            zoneId: null,
            targetName: undefined,
            rule: null,
          })
        }
        profileId={ruleModalState.profileId}
        zoneId={ruleModalState.zoneId}
        targetName={ruleModalState.targetName}
        rule={ruleModalState.rule}
        onSuccess={loadProfile}
      />

      <ShippingRuleDeleteModal
        openState={deleteRuleState.open}
        onClose={() => setDeleteRuleState({ open: false, rule: null })}
        rule={deleteRuleState.rule}
        onSuccess={loadProfile}
      />
    </div>
  );
};
