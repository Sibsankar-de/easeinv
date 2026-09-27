"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { toast } from "@/utils/toast";
import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { Button } from "@/components/ui/Button";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Trash2 } from "lucide-react";
import {
  deleteStoreThunk,
  selectStoreState,
} from "@/store/features/storeSlice";
import { selectCurrentStoreState } from "@/store/features/currentStoreSlice";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { TabContent } from "@/components/ui/Tabs";

export const SecuritySettingsTabContent = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { storeId } = useStoreNavigation();
  const [modalOpen, setModalOpen] = useState(false);
  const [confInput, setConfInput] = useState("");

  const storeState = useSelector(selectStoreState);
  const {
    data: { currentStore },
  } = useSelector(selectCurrentStoreState);

  const isDeleting = storeState.deleteStatus === "loading";
  const storeName = currentStore?.name || "";
  const confirmationLine = `delete/${storeName}`;

  const handleCloseModal = () => {
    setModalOpen(false);
    setConfInput("");
  };

  const handleDelete = () => {
    if (confInput !== confirmationLine) {
      toast.warn("Please enter the confirmation line correctly");
      return;
    }

    if (storeId) {
      dispatch(deleteStoreThunk(storeId))
        .unwrap()
        .then(() => {
          toast.success("Store deleted successfully!");
          setModalOpen(false);
          router.push("/profile");
        });
    }
  };

  return (
    <TabContent tabId="security" className="space-y-6">
      <PrimaryBox className="border-red-200 bg-red-50/10">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-1 font-sans">
              Danger Zone
            </h3>
            <p className="text-sm text-gray-600 font-sans">
              Permanently delete this store and all associated data including
              invoices, products, customers, and settings. This action is
              permanent and cannot be undone.
            </p>
          </div>
          <div>
            <Button
              variant="danger"
              className="gap-2"
              onClick={() => setModalOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete Store
            </Button>
          </div>
        </div>
      </PrimaryBox>

      <Modal
        openState={modalOpen}
        onClose={handleCloseModal}
        className="space-y-6 p-4 w-[90vw] sm:w-lg"
        header={<ModalHeader title="Delete Store Permanently" />}
      >
        <p className="text-gray-600 mb-6 font-sans">
          This action <strong className="text-red-500">cannot</strong> be
          undone. This will permanently delete the store{" "}
          <strong className="font-semibold">{storeName}</strong> and all of its
          associated records.
        </p>
        <div className="mb-6">
          <Label className="font-sans">
            Type{" "}
            <span className="text-red-400 font-semibold">
              {confirmationLine}
            </span>{" "}
            for confirmation.
          </Label>
          <Input
            placeholder={confirmationLine}
            onChange={(e) => setConfInput(e)}
            value={confInput}
            isInvalid={confInput.length > 0 && confInput !== confirmationLine}
            disabled={isDeleting}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleCloseModal}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting || confInput !== confirmationLine}
            loading={isDeleting}
          >
            Delete Permanently
          </Button>
        </div>
      </Modal>
    </TabContent>
  );
};
