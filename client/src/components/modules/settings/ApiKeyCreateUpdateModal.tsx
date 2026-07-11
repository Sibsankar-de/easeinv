import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  createApiKeyThunk,
  renameApiKeyThunk,
  selectApiKeyState,
} from "@/store/features/apiKeySlice";
import { ApiKeyDto } from "@/types/dto/apiKeyDto";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { WhitelistedOriginsInput } from "@/components/ui/WhitelistedOriginsInput";
import {
  ApiKeyScopeSelector,
  getClientSideAllowedScopes,
} from "@/components/ui/ApiKeyScopeSelector";
import { Button } from "@/components/ui/Button";
import { LineToggle } from "@/components/ui/LineToggle";
import descriptiveTooltip from "@/constants/descriptiveTooltip";
import { apiKeyStatus } from "@/constants/apiKeyConstants";
import { IconTooltip } from "@/components/ui/IconTooltip";

interface ApiKeyCreateUpdateModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  apiKey?: ApiKeyDto;
  onClose: () => void;
}

export const ApiKeyCreateUpdateModal = ({
  isOpen,
  mode,
  apiKey,
  onClose,
}: ApiKeyCreateUpdateModalProps) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { createStatus, renameStatus } = useSelector(selectApiKeyState);

  const isLoading =
    mode === "create" ? createStatus === "loading" : renameStatus === "loading";

  const [formData, setFormData] = useState({
    name: "",
    expiresAt: "",
    scopes: [] as string[],
    whitelistedOrigins: [] as string[],
    allowClientRequest: false,
    status: apiKeyStatus.ACTIVE,
  });

  useEffect(() => {
    if (mode === "edit" && apiKey) {
      const initialScopes = apiKey.allowClientRequest
        ? getClientSideAllowedScopes(apiKey.scopes || [])
        : apiKey.scopes || [];

      setFormData({
        name: apiKey.name,
        expiresAt: apiKey.expiresAt || "",
        scopes: initialScopes,
        whitelistedOrigins: apiKey.whitelistedOrigins || [],
        allowClientRequest: apiKey.allowClientRequest,
        status: apiKey.status || apiKeyStatus.ACTIVE,
      });
    }
  }, [mode, apiKey]);

  const handleFormChange = (
    key: keyof typeof formData,
    value: string | string[] | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const hasChanges =
    mode === "edit" && apiKey
      ? formData.name !== apiKey.name ||
        JSON.stringify(formData.scopes) !== JSON.stringify(apiKey.scopes) ||
        JSON.stringify(formData.whitelistedOrigins) !==
          JSON.stringify(apiKey.whitelistedOrigins || []) ||
        formData.allowClientRequest !== (apiKey.allowClientRequest || false) ||
        formData.status !== apiKey.status
      : true;

  const handleSubmit = () => {
    if (!formData.name || !storeId) return;

    let expiresAt = formData.expiresAt;
    if (mode === "create" && !expiresAt) {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 10);
      expiresAt = futureDate.toISOString().split("T")[0];
    }

    const payload = {
      ...formData,
      expiresAt,
      whitelistedOrigins: formData.allowClientRequest
        ? formData.whitelistedOrigins
        : [],
    };

    if (mode === "create") {
      dispatch(createApiKeyThunk({ storeId, formData: payload }))
        .unwrap()
        .then(() => {
          toast.success("Api key added.");
          onClose();
        });
    } else {
      if (!apiKey?._id) return;
      dispatch(
        renameApiKeyThunk({ storeId, keyId: apiKey._id, formData: payload }),
      )
        .unwrap()
        .then(() => {
          toast.success("Api key updated.");
          onClose();
        });
    }
  };

  return (
    <Modal
      openState={isOpen}
      onClose={onClose}
      className="w-3xl"
      header={
        <ModalHeader
          title={mode === "create" ? "Create API Key" : "Update API Key"}
          subtitle={
            mode === "create"
              ? "Generate a new key to access our developer APIs."
              : "Modify the settings and permissions for this key."
          }
        />
      }
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name" required>
            Key Name
          </Label>
          <Input
            id="name"
            placeholder="e.g. My store invoices"
            value={formData.name}
            disabled={isLoading}
            onChange={(val) => handleFormChange("name", val)}
          />
        </div>

        <div className="space-y-1.5">
          <LineToggle
            id="api-key-status"
            title="API Key Status"
            subTitle={
              formData.status === apiKeyStatus.ACTIVE
                ? "This API Key is active."
                : "This API Key is inactive and will block all requests."
            }
            toggleProps={{
              isActive: formData.status === apiKeyStatus.ACTIVE,
              disabled: isLoading,
              onChange: (val) => {
                handleFormChange(
                  "status",
                  val ? apiKeyStatus.ACTIVE : apiKeyStatus.INACTIVE,
                );
              },
            }}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Label htmlFor="expiry" className="mb-0">
              Expiration
            </Label>
            {mode === "create" && (
              <IconTooltip
                tooltip={descriptiveTooltip.API_KEY_EXPIRY}
                tooltipId="expiry-tooltip"
              />
            )}
          </div>
          <Input
            id="expiry"
            type="date"
            value={formData.expiresAt}
            disabled={isLoading}
            onChange={(val) => handleFormChange("expiresAt", val)}
          />
        </div>

        <div className="space-y-1.5">
          <LineToggle
            id="allow-client-request"
            title="Allow Client Request"
            subTitle="Enable to make API requests directly from client-side (browsers)."
            info={descriptiveTooltip.CLIENT_SIDE_API_REQUESTS}
            toggleProps={{
              isActive: formData.allowClientRequest,
              disabled: isLoading,
              onChange: (val) => {
                handleFormChange("allowClientRequest", val);
                if (!val) {
                  handleFormChange("whitelistedOrigins", []);
                } else {
                  const allowedScopes = getClientSideAllowedScopes(
                    formData.scopes,
                  );
                  handleFormChange("scopes", allowedScopes);
                }
              },
            }}
          />
        </div>

        {formData.allowClientRequest && (
          <div className="space-y-1.5">
            <Label required>Whitelisted Origins</Label>
            <WhitelistedOriginsInput
              origins={formData.whitelistedOrigins}
              disabled={isLoading || !formData.allowClientRequest}
              onChange={(origins) =>
                handleFormChange("whitelistedOrigins", origins)
              }
            />
          </div>
        )}

        <div className="space-y-2.5">
          <Label>Select Scopes & Permissions</Label>
          <ApiKeyScopeSelector
            selectedScopes={formData.scopes}
            disabled={isLoading}
            allowClientRequest={formData.allowClientRequest}
            onSelect={(scopes) => handleFormChange("scopes", scopes)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={
              !formData.name || isLoading || (mode === "edit" && !hasChanges)
            }
            loading={isLoading}
            onClick={handleSubmit}
          >
            {mode === "create" ? "Create Key" : "Update Key"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
