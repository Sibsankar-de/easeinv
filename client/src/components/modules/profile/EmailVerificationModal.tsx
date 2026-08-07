"use client";

import { Button } from "@/components/ui/Button";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { useDispatch, useSelector } from "react-redux";
import {
  resendVerificationThunk,
  selectUserSate,
  resetResendVerificationStatus,
} from "@/store/features/userSlice";
import { Mail, CheckCircle2 } from "lucide-react";
import { toast } from "@/utils/toast";
import { useEffect } from "react";
import { cn } from "@/components/utils";

export function EmailVerificationModal({
  openState,
  onClose,
}: {
  openState: boolean;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  const { resendVerificationStatus } = useSelector(selectUserSate);

  useEffect(() => {
    if (openState) {
      dispatch(resetResendVerificationStatus());
    }
  }, [openState, dispatch]);

  const handleSendVerification = async () => {
    await dispatch(resendVerificationThunk())
      .unwrap()
      .then(() => {
        toast.success("Verification email sent successfully!");
      });
  };

  const isLoading = resendVerificationStatus === "loading";
  const isSuccess = resendVerificationStatus === "success";

  return (
    <Modal
      openState={openState}
      onClose={onClose}
      className="p-6 space-y-6 w-xl"
      header={<ModalHeader title="Verify your Email" />}
    >
      {isSuccess ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center",
            "space-y-4 py-4 text-center",
          )}
        >
          <div
            className={cn(
              "w-12 h-12 rounded-full bg-green-50",
              "flex items-center justify-center",
            )}
          >
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Email Sent!</h3>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            We have sent a verification link to your email address. Please check
            your inbox (and spam folder) and follow the link.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Click the button below to receive a verification link at your
            registered email address. Following the link will verify your email
            and unlock all features.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSendVerification}
              loading={isLoading}
              disabled={isLoading}
              className="justify-center"
            >
              <Mail size={16} />
              Get Verification Email
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
