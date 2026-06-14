import { ApiKeyScopeSelector } from "@/components/ui/ApiKeyScopeSelector";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
import { TabContent } from "@/components/ui/Tabs";
import { cn } from "@/components/utils";
import { apiKeyStatus } from "@/constants/apiKeyConstants";
import { bannerDescriptions } from "@/constants/bannerDescriptions";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  createApiKeyThunk,
  fetchApiKeyListThunk,
  renameApiKeyThunk,
  revokeApiKeyThunk,
  selectApiKeyState,
} from "@/store/features/apiKeySlice";
import { ApiKeyDto } from "@/types/dto/apiKeyDto";
import { formatDateStr } from "@/utils/formatDate";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { Check, Copy, Key, Pen, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createIndex, search, SearchRule } from "@/utils/genericSearch";

const ApiKeyTableActions = ({ apiKey }: { apiKey: ApiKeyDto }) => {
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const isRevoked = apiKey.status === apiKeyStatus.REVOKED;
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        className="p-2 text-primary"
        tooltip="Rename key"
        disabled={isRevoked}
        onClick={() => setRenameModalOpen(true)}
      >
        <Pen className="w-4 h-4" />
      </Button>
      <Button
        variant="danger"
        className="p-2"
        tooltip="Revoke Key"
        disabled={isRevoked}
        onClick={() => setRevokeModalOpen(true)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <RenameApiKeyModal
        isOpen={renameModalOpen}
        apiKey={apiKey}
        onClose={() => setRenameModalOpen(false)}
      />

      <RevokeApiKeyModal
        isOpen={revokeModalOpen}
        apiKey={apiKey}
        onClose={() => setRevokeModalOpen(false)}
      />
    </div>
  );
};

const KeyCopyButton = ({ apiKey }: { apiKey: ApiKeyDto }) => {
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  const handleCopyKey = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMap((prev) => ({ ...prev, [id]: true }));
    toast.success("API Key copied to clipboard!");
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };
  return (
    <Button
      variant="outline"
      className="p-1.5 border-none"
      tooltip="Copy API Key"
      onClick={() => handleCopyKey(apiKey.key, apiKey._id)}
    >
      {copiedMap[apiKey._id] ? (
        <Check className="w-3.5 h-3.5 text-green-600" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-gray-400" />
      )}
    </Button>
  );
};

export const ApiKeyTabContent = () => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const {
    data: { apiKeyList },
    status: fetchStatus,
  } = useSelector(selectApiKeyState);

  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  // fetch apikey list
  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchApiKeyListThunk(storeId));
    }
  }, [fetchStatus]);

  // Search rules configuration - Search only on name
  const searchRules = useMemo<SearchRule<ApiKeyDto>[]>(
    () => [
      { field: "name", priority: 10, mode: "prefix" },
      { field: "name", priority: 5, mode: "substring" },
    ],
    [],
  );

  const searchIndex = useMemo(
    () => createIndex(apiKeyList, searchRules),
    [apiKeyList, searchRules],
  );

  // Filter API keys by search term using local search
  const searchedApiKeys = useMemo(() => {
    if (!searchTerm.trim()) {
      return apiKeyList;
    }
    return search(searchIndex, searchTerm, apiKeyList.length);
  }, [apiKeyList, searchIndex, searchTerm]);

  // Sort API keys locally
  const sortedApiKeys = useMemo(() => {
    const data = [...searchedApiKeys];
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      if (id === "expiresAt") {
        data.sort((a, b) => {
          const dateA = a.expiresAt ? new Date(a.expiresAt).getTime() : 0;
          const dateB = b.expiresAt ? new Date(b.expiresAt).getTime() : 0;
          return desc ? dateB - dateA : dateA - dateB;
        });
      }
    }
    return data;
  }, [searchedApiKeys, sorting]);

  // API Key columns definition
  const columns = useMemo<ColumnDef<ApiKeyDto>[]>(
    () => [
      {
        header: "Name",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {row.original.name}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">
              Created on {formatDateStr(row.original.createdAt)?.dateStr}
            </span>
          </div>
        ),
      },
      {
        header: "API Key",
        enableSorting: false,
        cell: ({ row }) => {
          const isRevoked = row.original.status === apiKeyStatus.REVOKED;
          const displayToken = `${row.original.key.slice(0, 12)}...${row.original.key.slice(-4)}`;
          return (
            <div className="flex items-center gap-1">
              <code
                className={cn(
                  `px-2 py-1 border border-border rounded text-xs`,
                  isRevoked ? "line-through text-gray-400" : "text-gray-700",
                )}
              >
                {displayToken}
              </code>
              {!isRevoked && <KeyCopyButton apiKey={row.original} />}
            </div>
          );
        },
      },
      {
        header: "Scopes",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 max-w-[400px]">
            {row.original.scopes.map((scope) => (
              <Badge key={scope} variant="secondary">
                {scope}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        header: "Expires At",
        accessorKey: "expiresAt",
        cell: ({ row }) => {
          const isRevoked = row.original.status === "revoked";
          return (
            <span
              className={cn(
                "text-xs",
                isRevoked ? "text-gray-400" : "text-gray-600 font-medium",
              )}
            >
              {isRevoked
                ? "N/A"
                : formatDateStr(row.original.expiresAt).dateStr}
            </span>
          );
        },
      },
      {
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => {
          const isActive = row.original.status === apiKeyStatus.ACTIVE;
          return (
            <Badge variant={isActive ? "success" : "danger"}>
              {row.original.status}
            </Badge>
          );
        },
        meta: { className: "text-center" },
      },
      {
        header: "Actions",
        enableSorting: false,
        meta: { className: "text-right" },
        cell: ({ row }) => <ApiKeyTableActions apiKey={row.original} />,
      },
    ],
    [apiKeyList],
  );

  const isLoading = fetchStatus === "loading";

  return (
    <TabContent tabId="api_keys" className="space-y-6">
      {/* Info banner */}
      <Banner variant="info" title="Developer API Access">
        {bannerDescriptions.API_KEY_TABLE_INFO_BANNER}
      </Banner>

      {/* Search and action bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search API keys by name..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
          />
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus size={16} />
          Create API Key
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={sortedApiKeys}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={setSorting}
        emptyState={
          searchTerm ? (
            <EmptyState
              title="No keys matched"
              description="We couldn't find any API keys matching your query."
              icon={<Key className="w-8 h-8 text-gray-400" />}
            />
          ) : (
            <EmptyState
              title="No API Keys created"
              description="Start by creating an API key to access our services externally."
              icon={<Key className="w-8 h-8 text-gray-400" />}
              action={
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="w-4 h-4" /> Create your first key
                </Button>
              }
            />
          )
        }
      />

      {/* Sub-component modals */}
      <CreateApiKeyModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </TabContent>
  );
};

const CreateApiKeyModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { createStatus } = useSelector(selectApiKeyState);

  const [formData, setFormData] = useState({
    name: "",
    expiresAt: "",
    scopes: [] as string[],
  });

  const handleFormChange = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreateApiKey = () => {
    if (!formData.name || !storeId) return;

    dispatch(createApiKeyThunk({ storeId, formData }))
      .unwrap()
      .then(() => {
        toast.success("Api key added.");
        onClose();
      });
  };

  const isLoading = createStatus === "loading";

  return (
    <Modal
      openState={isOpen}
      onClose={onClose}
      className="w-2xl"
      header={
        <ModalHeader
          title="Create API Key"
          subtitle="Generate a new key to access our developer APIs."
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
            onChange={(e) => handleFormChange("name", e)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="expiry">Expiration</Label>
          <Input
            id="expiry"
            type="date"
            value={formData.expiresAt}
            disabled={isLoading}
            onChange={(e) => handleFormChange("expiresAt", e)}
          />
        </div>

        <div className="space-y-2.5">
          <Label>Select Scopes & Permissions</Label>
          <ApiKeyScopeSelector
            selectedScopes={formData.scopes}
            disabled={isLoading}
            onSelect={(scopes) => handleFormChange("scopes", scopes)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={isLoading || !formData.name}
            loading={isLoading}
            onClick={handleCreateApiKey}
          >
            Create Key
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const RenameApiKeyModal = ({
  isOpen,
  apiKey,
  onClose,
}: {
  isOpen: boolean;
  apiKey: ApiKeyDto;
  onClose: () => void;
}) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { renameStatus } = useSelector(selectApiKeyState);

  const [name, setName] = useState(apiKey.name);

  const handleRename = () => {
    if (!name || !storeId || !apiKey._id) return;

    dispatch(
      renameApiKeyThunk({ storeId, keyId: apiKey._id, formData: { name } }),
    )
      .unwrap()
      .then(() => {
        toast.success("Api key renamed.");
        onClose();
      });
  };

  const isLoading = renameStatus === "loading";

  return (
    <Modal
      openState={isOpen}
      onClose={onClose}
      className="w-xl"
      header={
        <ModalHeader
          title="Rename API Key"
          subtitle="Update the description of this key."
        />
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="rename-input" required>
            Key Name
          </Label>
          <Input
            id="rename-input"
            value={name}
            disabled={isLoading}
            onChange={setName}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!name || isLoading || name === apiKey.name}
            loading={isLoading}
            onClick={handleRename}
          >
            Rename
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const RevokeApiKeyModal = ({
  isOpen,
  apiKey,
  onClose,
}: {
  isOpen: boolean;
  apiKey: ApiKeyDto;
  onClose: () => void;
}) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { revokeStatus } = useSelector(selectApiKeyState);

  const handleRevoke = () => {
    if (!storeId || !apiKey._id) return;

    dispatch(revokeApiKeyThunk({ storeId, keyId: apiKey._id }))
      .unwrap()
      .then(() => {
        toast.success("Api key revoked.");
        onClose();
      });
  };

  const isLoading = revokeStatus === "loading";
  return (
    <Modal
      openState={isOpen}
      onClose={onClose}
      className="w-xl"
      header={
        <ModalHeader
          title="Revoke API Key"
          subtitle="This action is permanent and cannot be undone."
        />
      }
    >
      <div className="space-y-4">
        <div className="text-gray-600">
          Revoking <strong>{apiKey.name}</strong> will block all incoming
          requests using this key immediately. Any connected application will
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
            onClick={handleRevoke}
          >
            Revoke Key
          </Button>
        </div>
      </div>
    </Modal>
  );
};
