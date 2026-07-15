"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchStoreList } from "@/store/features/storeSlice";
import { fetchApiKeyListThunk } from "@/store/features/apiKeySlice";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { Play } from "lucide-react";
import { cn } from "../../utils";
import { ApiKeyInput } from "./ApiKeyInput";
import { CollectionAccordion, Endpoint } from "./CollectionAccordion";
import { QueryParamTable } from "./QueryParamTable";
import { RequestSnippet } from "./RequestSnippet";
import { ResponseConsole } from "./ResponseConsole";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { SpreadText } from "@/components/ui/SpreadText";
import { useNavContext } from "@/contexts/NavContext";

const TEST_KEY = "sk_easeinv_test_2026_ab89cf";

const endpoints: Endpoint[] = [
  {
    id: "list-products",
    method: "GET",
    path: "/v1/products",
    name: "List Products",
    description:
      "Retrieve a paginated list of products in your store's inventory.",
    collection: "products",
    params: [
      {
        name: "limit",
        type: "integer",
        required: false,
        desc: "Number of products to return (default 20).",
      },
      {
        name: "page",
        type: "integer",
        required: false,
        desc: "Page number to fetch.",
      },
    ],
    mockResponse: () => ({
      success: true,
      data: [
        {
          id: "prod_01J0EAW",
          name: "Wireless Ergonomic Mouse",
          sku: "WRLS-MSE-01",
          buyingPrice: 15.0,
          sellingPrice: 29.99,
          stock: 42,
          currency: "USD",
        },
        {
          id: "prod_02K1FBX",
          name: "Bluetooth Mechanical Keyboard",
          sku: "KB-MECH-87",
          buyingPrice: 45.0,
          sellingPrice: 89.99,
          stock: 15,
          currency: "USD",
        },
      ],
    }),
  },
  {
    id: "create-product",
    method: "POST",
    path: "/v1/products",
    name: "Create Product",
    description: "Add a new product item to your store catalog.",
    collection: "products",
    defaultBody: JSON.stringify(
      {
        name: "USB-C Laptop Docking Station",
        sku: "DOCK-USBC-03",
        buyingPrice: 60.0,
        sellingPrice: 119.99,
        stock: 30,
      },
      null,
      2,
    ),
    mockResponse: (body) => {
      try {
        const parsed = JSON.parse(body || "{}");
        return {
          success: true,
          message: "Product created successfully",
          data: {
            id: `prod_${Math.random().toString(36).substring(2, 9)}`,
            name: parsed.name || "USB-C Laptop Docking Station",
            sku: parsed.sku || "DOCK-USBC-03",
            buyingPrice: parsed.buyingPrice || 60.0,
            sellingPrice: parsed.sellingPrice || 119.99,
            stock: parsed.stock || 30,
            currency: "USD",
            createdAt: new Date().toISOString(),
          },
        };
      } catch (e) {
        return { success: false, error: "Invalid JSON body provided" };
      }
    },
  },
  {
    id: "list-customers",
    method: "GET",
    path: "/v1/customers",
    name: "List Customers",
    description:
      "Retrieve customer list and aggregate statistics for your store.",
    collection: "customers",
    params: [
      {
        name: "searchTerm",
        type: "string",
        required: false,
        desc: "Search customers by name, phone or email.",
      },
    ],
    mockResponse: () => ({
      success: true,
      data: [
        {
          id: "cust_01J0EBF",
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+1 (555) 019-2834",
          invoicesCount: 3,
          totalSpent: 149.97,
        },
        {
          id: "cust_02K1GCA",
          name: "Alice Smith",
          email: "alice.smith@example.com",
          phone: "+1 (555) 048-9921",
          invoicesCount: 1,
          totalSpent: 89.99,
        },
      ],
    }),
  },
  {
    id: "create-customer",
    method: "POST",
    path: "/v1/customers",
    name: "Create Customer",
    description:
      "Create a new customer profile for tracking billing and transactions.",
    collection: "customers",
    defaultBody: JSON.stringify(
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+1 (555) 012-3456",
      },
      null,
      2,
    ),
    mockResponse: (body) => {
      try {
        const parsed = JSON.parse(body || "{}");
        return {
          success: true,
          message: "Customer created successfully",
          data: {
            id: `cust_${Math.random().toString(36).substring(2, 9)}`,
            name: parsed.name || "Jane Smith",
            email: parsed.email || "jane.smith@example.com",
            phone: parsed.phone || "+1 (555) 012-3456",
            invoicesCount: 0,
            totalSpent: 0.0,
            createdAt: new Date().toISOString(),
          },
        };
      } catch (e) {
        return { success: false, error: "Invalid JSON body provided" };
      }
    },
  },
  {
    id: "list-invoices",
    method: "GET",
    path: "/v1/invoices",
    name: "List Invoices",
    description:
      "Retrieve a history of generated billing invoices and transactions.",
    collection: "invoices",
    params: [
      {
        name: "limit",
        type: "integer",
        required: false,
        desc: "Number of invoices to return (default 20).",
      },
      {
        name: "page",
        type: "integer",
        required: false,
        desc: "Page number to fetch.",
      },
    ],
    mockResponse: () => ({
      success: true,
      data: [
        {
          invoiceId: "inv_2026_58291",
          customerId: "cust_01J0EBF",
          items: [{ productId: "prod_01J0EAW", quantity: 2 }],
          subtotal: 59.98,
          taxRate: 8.5,
          taxAmount: 5.1,
          discount: 0.0,
          total: 65.08,
          paymentMode: "UPI",
          status: "PAID",
          createdAt: "2026-06-25T14:30:00Z",
        },
      ],
    }),
  },
  {
    id: "create-invoice",
    method: "POST",
    path: "/v1/invoices",
    name: "Create Invoice",
    description: "Generate a new billing invoice transaction for a customer.",
    collection: "invoices",
    defaultBody: JSON.stringify(
      {
        customerId: "cust_01J0EBF",
        items: [
          { productId: "prod_01J0EAW", quantity: 2 },
          { productId: "prod_02K1FBX", quantity: 1 },
        ],
        taxRate: 8.5,
        discount: 5.0,
        paymentMode: "UPI",
      },
      null,
      2,
    ),
    mockResponse: (body) => {
      try {
        const parsed = JSON.parse(body || "{}");
        const subtotal = 149.97;
        const taxAmount = parseFloat(
          ((subtotal * (parsed.taxRate || 8.5)) / 100).toFixed(2),
        );
        const total = parseFloat(
          (subtotal + taxAmount - (parsed.discount || 5.0)).toFixed(2),
        );
        return {
          success: true,
          message: "Invoice generated successfully",
          data: {
            invoiceId: `inv_${new Date().getFullYear()}_${Math.floor(10000 + Math.random() * 90000)}`,
            customerId: parsed.customerId || "cust_01J0EBF",
            items: parsed.items || [],
            subtotal,
            taxRate: parsed.taxRate || 8.5,
            taxAmount,
            discount: parsed.discount || 5.0,
            total,
            paymentMode: parsed.paymentMode || "UPI",
            status: "PAID",
            createdAt: new Date().toISOString(),
          },
        };
      } catch (e) {
        return { success: false, error: "Invalid JSON body provided" };
      }
    },
  },
];

export function InteractiveApiDocs() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAuth();
  const { navHeight } = useNavContext();

  const [apiKey, setApiKey] = useState("");
  const [activeEndpointId, setActiveEndpointId] = useState(endpoints[0].id);
  const [reqBody, setReqBody] = useState("");
  const [loadingPlayground, setLoadingPlayground] = useState(false);
  const [playgroundResponse, setPlaygroundResponse] = useState<object | null>(
    null,
  );
  const [responseStatus, setResponseStatus] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  // Fetch store and API key list if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchStoreList())
        .unwrap()
        .then((stores: Array<{ id: string }>) => {
          if (stores && stores.length > 0) {
            dispatch(fetchApiKeyListThunk(stores[0].id));
          }
        });
    }
  }, [isAuthenticated, dispatch]);

  const activeEndpoint =
    endpoints.find((e) => e.id === activeEndpointId) || endpoints[0];

  const handleSelectEndpoint = (id: string) => {
    setActiveEndpointId(id);
    const selected = endpoints.find((e) => e.id === id) || endpoints[0];
    setReqBody(selected.defaultBody || "");
    setPlaygroundResponse(null);
    setResponseStatus(null);
    setResponseTime(null);
  };

  // Load key from localStorage on mount, defaulting to TEST_KEY
  useEffect(() => {
    const savedKey = localStorage.getItem("easeinv_docs_api_key");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApiKey(savedKey || TEST_KEY);
  }, []);

  const handleKeyChange = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem("easeinv_docs_api_key", newKey);
  };

  const handleResetKey = () => {
    setApiKey(TEST_KEY);
    localStorage.setItem("easeinv_docs_api_key", TEST_KEY);
    toast.info("Reset to sandbox test key");
  };

  const runPlayground = async () => {
    setLoadingPlayground(true);
    setPlaygroundResponse(null);
    const start = performance.now();

    // simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const res = activeEndpoint.mockResponse(reqBody);
    const end = performance.now();

    setResponseTime(Math.round(end - start));
    setResponseStatus(
      res.hasOwnProperty("error")
        ? "400 Bad Request"
        : activeEndpoint.method === "POST"
          ? "201 Created"
          : "200 OK",
    );
    setPlaygroundResponse(res);
    setLoadingPlayground(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Section: API Key Input */}
      <div className="space-y-2">
        <ApiKeyInput
          apiKey={apiKey}
          onKeyChange={handleKeyChange}
          onReset={handleResetKey}
        />
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Directory Accordion & Endpoint Info */}
        <div
          className="lg:col-span-4 sticky pr-1.5 space-y-6"
          style={{
            top: `${navHeight + 5}px`,
            maxHeight: `calc(100vh-${navHeight + 5}px)`,
          }}
        >
          <div className="space-y-2">
            <SpreadText
              as="h4"
              tracking="widest"
              className="text-[10px] text-slate-400 px-1"
            >
              API Collections
            </SpreadText>
            <CollectionAccordion
              endpoints={endpoints}
              activeEndpointId={activeEndpointId}
              onSelectEndpoint={handleSelectEndpoint}
            />
          </div>
        </div>

        {/* Right Column: Parameters, Sandbox Try out, Request Snippet & Response Block */}
        <div className="lg:col-span-8 space-y-6">
          {/* Endpoint Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "text-[10px] font-extrabold px-2 py-0.5 rounded font-mono border",
                  activeEndpoint.method === "GET"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-blue-50 text-blue-700 border-blue-100",
                )}
              >
                {activeEndpoint.method}
              </span>
              <h3 className="text-xs font-bold font-mono text-slate-600">
                https://api.easeinv.com{activeEndpoint.path}
              </h3>
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                {activeEndpoint.name}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {activeEndpoint.description}
              </p>
            </div>
          </div>

          {/* Request Config Card (Query Params, Body, Try it Out Button) - Now at the Top */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <SpreadText className="text-xs text-slate-800">
                Request Inputs
              </SpreadText>
            </div>

            {/* Query parameters table */}
            <QueryParamTable params={activeEndpoint.params} />

            {/* Editable Request Body for POST */}
            {activeEndpoint.method === "POST" && (
              <div className="space-y-2">
                <Label>
                  <SpreadText className="text-xs text-slate-800">
                    Request Body (JSON)
                  </SpreadText>
                </Label>
                <Textarea
                  value={reqBody}
                  onChange={(e) => setReqBody(e)}
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>
            )}

            <Button
              className="w-full justify-center gap-2"
              loadingMessage="Sending request..."
              loading={loadingPlayground}
              disabled={loadingPlayground}
              onClick={runPlayground}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Try it Out
            </Button>
          </div>

          {/* Request Snippet Block */}
          <RequestSnippet endpoint={activeEndpoint} apiKey={apiKey} />

          {/* Response Block */}
          <ResponseConsole
            loading={loadingPlayground}
            response={playgroundResponse}
            status={responseStatus}
            time={responseTime}
          />
        </div>
      </div>
    </div>
  );
}
