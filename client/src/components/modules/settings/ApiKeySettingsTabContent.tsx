import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { TabContent } from "@/components/ui/Tabs";
import { bannerDescriptions } from "@/constants/bannerDescriptions";
import { ColumnDef } from "@tanstack/react-table";
import { Check, Copy, Edit2, Key, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";

interface ApiKeyItem {
  id: string;
  name: string;
  token: string;
  scopes: string[];
  expiresAt: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "revoked";
}

export const ApiKeyTabContent = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);

  // Copied state mapping
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  // API Keys state
  const [apiKeys] = useState<ApiKeyItem[]>([]);

  // Copy API Key handler
  const handleCopyKey = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMap((prev) => ({ ...prev, [id]: true }));
    toast.success("API Key copied to clipboard!");
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  // Filter API keys by search term
  const filteredApiKeys = useMemo(() => {
    return apiKeys.filter(
      (key) =>
        key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.token.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [apiKeys, searchTerm]);

  // API Key columns definition
  const columns = useMemo<ColumnDef<ApiKeyItem>[]>(
    () => [
      {
        header: "Name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {row.original.name}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">
              Created on {row.original.createdAt}
            </span>
          </div>
        ),
      },
      {
        header: "API Key",
        cell: ({ row }) => {
          const isRevoked = row.original.status === "revoked";
          const displayToken = `${row.original.token.slice(0, 12)}...${row.original.token.slice(-4)}`;
          return (
            <div className="flex items-center gap-2">
              <code
                className={`px-2.5 py-1 bg-gray-50 border border-gray-200 rounded font-mono text-xs ${isRevoked ? "line-through text-gray-400" : "text-gray-700"}`}
              >
                {displayToken}
              </code>
              {!isRevoked && (
                <Button
                  variant="outline"
                  className="p-1 border-none"
                  tooltip="Copy API Key"
                  onClick={() =>
                    handleCopyKey(row.original.token, row.original.id)
                  }
                >
                  {copiedMap[row.original.id] ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </Button>
              )}
            </div>
          );
        },
      },
      {
        header: "Scopes",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
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
        cell: ({ row }) => {
          const isRevoked = row.original.status === "revoked";
          return (
            <span
              className={`text-xs ${isRevoked ? "text-gray-400" : "text-gray-600 font-medium"}`}
            >
              {isRevoked ? "N/A" : row.original.expiresAt}
            </span>
          );
        },
      },
      {
        header: "Last Used",
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 font-medium">
            {row.original.lastUsed}
          </span>
        ),
      },
      {
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original.status === "active";
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
        meta: { className: "text-right" },
        cell: ({ row }) => {
          const isRevoked = row.original.status === "revoked";
          return (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="p-2 h-8 w-8 flex items-center justify-center"
                tooltip="Rename key"
              >
                <Edit2 className="w-3.5 h-3.5 text-gray-500" />
              </Button>
              <Button
                variant="danger"
                className="p-2 h-8 w-8 flex items-center justify-center"
                tooltip="Revoke Key"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [copiedMap],
  );
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
        data={filteredApiKeys}
        isLoading={false}
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
              description="Start by creating an API key to access our backend services externally."
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

      <RenameApiKeyModal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
      />

      <RevokeApiKeyModal
        isOpen={revokeModalOpen}
        onClose={() => setRevokeModalOpen(false)}
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
  const [keyScopes, setKeyScopes] = useState<Record<string, boolean>>({
    "invoices:read": true,
    "invoices:write": false,
    "products:read": true,
    "products:write": false,
    "customers:read": true,
    "customers:write": false,
  });
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
          <Label htmlFor="key-name" required>
            Key Name
          </Label>
          <Input id="key-name" placeholder="e.g. Stripe Webhook Link" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="key-expiry">Expiration</Label>
          <Select
            id="key-expiry"
            options={[
              { key: "never", value: "Never expire (Recommended)" },
              { key: "30_days", value: "30 Days" },
              { key: "90_days", value: "90 Days" },
              { key: "365_days", value: "1 Year" },
            ]}
          />
        </div>

        <div className="space-y-2.5">
          <Label>Scopes & Permissions</Label>
          <div className="grid grid-cols-1 gap-2.5 border border-gray-200 rounded-lg p-3.5 bg-gray-50/50">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={keyScopes["invoices:read"]}
                onChange={(checked) =>
                  setKeyScopes((prev) => ({
                    ...prev,
                    "invoices:read": checked,
                  }))
                }
              />
              <div>
                <label className="text-xs font-semibold text-gray-900 block cursor-pointer select-none">
                  Read Invoices
                </label>
                <span className="text-[10px] text-gray-500">
                  Allows reading invoices, estimates, and receipts details.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-gray-150 pt-2.5">
              <Checkbox
                checked={keyScopes["invoices:write"]}
                onChange={(checked) =>
                  setKeyScopes((prev) => ({
                    ...prev,
                    "invoices:write": checked,
                  }))
                }
              />
              <div>
                <label className="text-xs font-semibold text-gray-900 block cursor-pointer select-none">
                  Write Invoices
                </label>
                <span className="text-[10px] text-gray-500">
                  Allows creating, editing, and deleting invoices.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-gray-150 pt-2.5">
              <Checkbox
                checked={keyScopes["products:read"]}
                onChange={(checked) =>
                  setKeyScopes((prev) => ({
                    ...prev,
                    "products:read": checked,
                  }))
                }
              />
              <div>
                <label className="text-xs font-semibold text-gray-900 block cursor-pointer select-none">
                  Read Inventory
                </label>
                <span className="text-[10px] text-gray-500">
                  Allows reading products, unit settings, and stocks.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-gray-150 pt-2.5">
              <Checkbox
                checked={keyScopes["products:write"]}
                onChange={(checked) =>
                  setKeyScopes((prev) => ({
                    ...prev,
                    "products:write": checked,
                  }))
                }
              />
              <div>
                <label className="text-xs font-semibold text-gray-900 block cursor-pointer select-none">
                  Write Inventory
                </label>
                <span className="text-[10px] text-gray-500">
                  Allows creating products, updating stocks, and unit rates.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary">Create Key</Button>
        </div>
      </div>
    </Modal>
  );
};

const RenameApiKeyModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal openState={isOpen} onClose={onClose} className="max-w-sm w-full">
      <ModalHeader
        title="Rename API Key"
        subtitle="Update the description of this key."
      />
      <div className="p-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="rename-input" required>
            Key Name
          </Label>
          <Input id="rename-input" />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary">Rename</Button>
        </div>
      </div>
    </Modal>
  );
};

const RevokeApiKeyModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal
      openState={isOpen}
      onClose={onClose}
      className="max-w-sm w-full"
      header={
        <ModalHeader
          title="Revoke API Key"
          subtitle="This action is permanent and cannot be undone."
        />
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Are you sure?</p>
          <p className="text-xs text-gray-500 mt-1 leading-normal">
            Revoking{" "}
            <span className="font-semibold">
              &quot;{"selectedKeyName"}&quot;
            </span>{" "}
            will block all incoming requests using this key immediately. Any
            connected application will break.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger">Revoke Key</Button>
        </div>
      </div>
    </Modal>
  );
};
