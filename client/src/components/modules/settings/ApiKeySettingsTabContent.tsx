import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { TabContent } from "@/components/ui/Tabs";
import { cn } from "@/components/utils";
import { apiKeyStatus } from "@/constants/apiKeyConstants";
import { bannerDescriptions } from "@/constants/bannerDescriptions";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  fetchApiKeyListThunk,
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
import { ApiKeyCreateUpdateModal } from "./ApiKeyCreateUpdateModal";
import { RemoveApiKeyModal } from "./RemoveApiKeyModal";

const ApiKeyTableActions = ({ apiKey }: { apiKey: ApiKeyDto }) => {
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        className="p-2 text-primary"
        tooltip="Update key"
        onClick={() => setUpdateModalOpen(true)}
      >
        <Pen className="w-4 h-4" />
      </Button>
      <Button
        variant="danger"
        className="p-2"
        tooltip="Delete Key"
        onClick={() => setDeleteModalOpen(true)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <ApiKeyCreateUpdateModal
        key={`${apiKey.id}-${updateModalOpen}`}
        isOpen={updateModalOpen}
        mode="edit"
        apiKey={apiKey}
        onClose={() => setUpdateModalOpen(false)}
      />

      <RemoveApiKeyModal
        isOpen={deleteModalOpen}
        apiKey={apiKey}
        onClose={() => setDeleteModalOpen(false)}
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
      onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
    >
      {copiedMap[apiKey.id] ? (
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
          const isRevoked = row.original.status === apiKeyStatus.INACTIVE;
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
      <ApiKeyCreateUpdateModal
        isOpen={createModalOpen}
        mode="create"
        onClose={() => setCreateModalOpen(false)}
      />
    </TabContent>
  );
};
