import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useStoreNavigation } from "@/hooks/store-navigation";
import { selectApiKeyState, deleteApiKeyThunk } from "@/store/features/apiKeySlice";
import { ApiKeyDto } from "@/types/dto/apiKeyDto";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface RemoveApiKeyModalProps {
  isOpen: boolean;
  apiKey: ApiKeyDto;
  onClose: () => void;
}

export const RemoveApiKeyModal = ({
  isOpen,
  apiKey,
  onClose,
}: RemoveApiKeyModalProps) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { deleteStatus } = useSelector(selectApiKeyState);

  const handleDelete = () => {
    if (!storeId || !apiKey.id) return;

    dispatch(deleteApiKeyThunk({ storeId, keyId: apiKey.id }))
      .unwrap()
      .then(() => {
        toast.success("Api key deleted.");
        onClose();
      });
  };

  const isLoading = deleteStatus === "loading";
  return (
    <Modal
      openState={isOpen}
      onClose={onClose}
      className="w-xl"
      header={
        <ModalHeader
          title="Delete API Key"
          subtitle="This action is permanent and cannot be undone."
        />
      }
    >
      <div className="space-y-4">
        <div className="text-gray-600">
          Deleting <strong>{apiKey.name}</strong> will block all incoming
          requests using this key permanently. Any connected application will
          break.
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={isLoading}
            loading={isLoading}
            onClick={handleDelete}
          >
            Delete Key
          </Button>
        </div>
      </div>
    </Modal>
  );
};
