"use client";

import React, { useEffect, useState } from "react";
import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { Button } from "@/components/ui/Button";
import { Store, UserPlus, CheckCircle, ArrowRight } from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptStoreUserInviteThunk,
  fetchStoreUserInviteThunk,
  selectStoreState,
} from "@/store/features/storeSlice";
import { Skeleton } from "@/components/ui/Skeleton";

export const StoreInviteAcceptComponent = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const queries = useSearchParams();
  const token = queries.get("token");

  const [stage, setStage] = useState<1 | 2>(1);
  const [storeId, setStoreId] = useState("");

  const {
    data: { userInvite },
    userInviteGetStatus,
    userInviteAcceptStatus,
  } = useSelector(selectStoreState);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchStoreUserInviteThunk(token));
  }, [token, dispatch]);

  const handleAcceptInvite = () => {
    if (!token) return;
    dispatch(acceptStoreUserInviteThunk(token))
      .unwrap()
      .then((res: any) => {
        setStoreId(res?.storeId);
        setStage(2);
      });
  };

  const handleStoreRoute = () => {
    if (!storeId) return;
    router.push(`/stores/${storeId}`);
  };

  const isAccepting = userInviteAcceptStatus === "loading";

  if (userInviteGetStatus === "loading") return <Skeleton />;

  // Stage 1: Invitation UI
  if (stage === 1) {
    return (
      <PrimaryBox className="max-w-md mx-auto py-12 text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Store Invitation
        </h2>
        <p className="text-gray-500 mb-8">
          You have been invited to collaborate on a store. Accept the invitation
          to get started.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Store className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Store Name
              </p>
              <p className="font-semibold text-gray-900">
                {userInvite.storeName}
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-3" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <UserPlus className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Your Role
              </p>
              <p className="font-semibold text-indigo-600">{userInvite.role}</p>
            </div>
          </div>
        </div>

        <div>
          <Button
            className="w-full justify-center text-lg"
            disabled={isAccepting}
            loading={isAccepting}
            onClick={handleAcceptInvite}
          >
            Accept Invitation
          </Button>
        </div>
      </PrimaryBox>
    );
  }

  // Stage 2: Success UI
  return (
    <PrimaryBox className="max-w-md mx-auto py-12 px-4 text-center">
      <div className="flex justify-center mb-8">
        <div className="bg-green-50 p-4 rounded-2xl">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Invitation Accepted!
      </h2>
      <p className="text-gray-500 mb-8">
        You are now a member of <strong>{userInvite.storeName}</strong>. You can
        now access the store dashboard and manage operations.
      </p>

      <Button
        className="w-full justify-center text-lg group"
        onClick={handleStoreRoute}
      >
        Go to Dashboard
        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </PrimaryBox>
  );
};
