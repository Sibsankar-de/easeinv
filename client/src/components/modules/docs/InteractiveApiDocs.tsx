"use client";

import { useState, useEffect, useCallback } from "react";
import { Play } from "lucide-react";
import { cn } from "../../utils";
import { ApiKeyInput } from "./ApiKeyInput";
import { CollectionAccordion } from "./CollectionAccordion";
import { QueryParamInputs } from "./QueryParamTable";
import { PathParamInputs } from "./PathParamInputs";
import { ScopeBadges } from "./ScopeBadges";
import { RequestSnippet } from "./RequestSnippet";
import { ResponseConsole, ProxyResponse } from "./ResponseConsole";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { SpreadText } from "@/components/ui/SpreadText";
import { Badge } from "@/components/ui/Badge";
import { useNavContext } from "@/contexts/NavContext";
import { API_ENDPOINTS, ApiEndpoint } from "@/lib/api-explorer/endpoints";

const DUMMY_TEST_KEY = "sk_easeinv_test_dummy_key";
const LS_KEY = "easeinv_docs_api_key";

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-50 text-emerald-700 border-emerald-100",
  POST: "bg-blue-50 text-blue-700 border-blue-100",
  PATCH: "bg-orange-50 text-orange-700 border-orange-100",
  DELETE: "bg-rose-50 text-rose-700 border-rose-100",
};

/** Extract :paramName tokens from a path string */
function extractPathParams(path: string): string[] {
  return (path.match(/:([a-zA-Z]+)/g) || []).map((p) => p.slice(1));
}

/** Replace :param tokens in path with values from the map */
function resolvePath(
  path: string,
  pathValues: Record<string, string>,
): string {
  let resolved = path;
  for (const [key, val] of Object.entries(pathValues)) {
    resolved = resolved.replace(`:${key}`, encodeURIComponent(val || `:${key}`));
  }
  return resolved;
}

/** Append non-empty query params to a path */
function appendQuery(path: string, queryValues: Record<string, string>): string {
  const qs = Object.entries(queryValues)
    .filter(([, v]) => v.trim() !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return qs ? `${path}?${qs}` : path;
}

function buildResolvedPath(
  endpoint: ApiEndpoint,
  pathValues: Record<string, string>,
  queryValues: Record<string, string>,
): string {
  const withPath = resolvePath(endpoint.path, pathValues);
  const queryParams = (endpoint.params || []).filter((p) => p.in === "query");
  const queryOnlyValues: Record<string, string> = {};
  for (const p of queryParams) {
    if (queryValues[p.name]) queryOnlyValues[p.name] = queryValues[p.name];
  }
  return appendQuery(withPath, queryOnlyValues);
}

function initStateForEndpoint(endpoint: ApiEndpoint) {
  const pathParamNames = extractPathParams(endpoint.path);
  const pathValues: Record<string, string> = {};
  for (const n of pathParamNames) pathValues[n] = "";

  const queryValues: Record<string, string> = {};
  for (const p of (endpoint.params || []).filter((p) => p.in === "query")) {
    queryValues[p.name] = "";
  }

  const bodyStr = endpoint.defaultBody
    ? JSON.stringify(endpoint.defaultBody, null, 2)
    : "";

  return { pathValues, queryValues, bodyStr };
}

export function InteractiveApiDocs() {
  const { navHeight } = useNavContext();

  const [apiKey, setApiKey] = useState(DUMMY_TEST_KEY);
  const [activeEndpointId, setActiveEndpointId] = useState(API_ENDPOINTS[0].id);
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [bodyStr, setBodyStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ProxyResponse | null>(null);

  // Load saved API key from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setApiKey(saved);
  }, []);

  const handleKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem(LS_KEY, key);
  };

  const handleResetKey = () => {
    setApiKey(DUMMY_TEST_KEY);
    localStorage.setItem(LS_KEY, DUMMY_TEST_KEY);
  };

  const activeEndpoint =
    API_ENDPOINTS.find((e) => e.id === activeEndpointId) ?? API_ENDPOINTS[0];

  const handleSelectEndpoint = useCallback((id: string) => {
    const ep = API_ENDPOINTS.find((e) => e.id === id) ?? API_ENDPOINTS[0];
    setActiveEndpointId(id);
    const { pathValues, queryValues, bodyStr } = initStateForEndpoint(ep);
    setPathValues(pathValues);
    setQueryValues(queryValues);
    setBodyStr(bodyStr);
    setResponse(null);
  }, []);

  // Init state for the first endpoint on mount
  useEffect(() => {
    const { pathValues, queryValues, bodyStr } = initStateForEndpoint(
      API_ENDPOINTS[0],
    );
    setPathValues(pathValues);
    setQueryValues(queryValues);
    setBodyStr(bodyStr);
  }, []);

  const pathParams = (activeEndpoint.params || []).filter((p) => p.in === "path");
  const queryParams = (activeEndpoint.params || []).filter((p) => p.in === "query");
  const hasBody = ["POST", "PATCH"].includes(activeEndpoint.method);

  const resolvedPath = buildResolvedPath(activeEndpoint, pathValues, queryValues);

  const runPlayground = async () => {
    setLoading(true);
    setResponse(null);

    let parsedBody: unknown = undefined;
    if (hasBody && bodyStr.trim()) {
      try {
        parsedBody = JSON.parse(bodyStr);
      } catch {
        setResponse({
          status: 400,
          statusText: "Bad Request",
          data: { message: "Invalid JSON in request body" },
          elapsed: 0,
        });
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/docs-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: activeEndpoint.method,
          path: resolvedPath,
          body: parsedBody,
          apiKey,
        }),
      });
      const data: ProxyResponse = await res.json();
      setResponse(data);
    } catch {
      setResponse({
        status: 500,
        statusText: "Network Error",
        data: { message: "Could not reach the proxy. Is the server running?" },
        elapsed: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* API Key Input */}
      <ApiKeyInput
        apiKey={apiKey}
        onKeyChange={handleKeyChange}
        onReset={handleResetKey}
      />

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Collection Accordion */}
        <div
          className="lg:col-span-4 sticky pr-1.5"
          style={{
            top: `${navHeight + 8}px`,
            maxHeight: `calc(100vh - ${navHeight + 24}px)`,
            overflowY: "auto",
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
              endpoints={API_ENDPOINTS}
              activeEndpointId={activeEndpointId}
              onSelectEndpoint={handleSelectEndpoint}
            />
          </div>
        </div>

        {/* Right: Endpoint details + Playground */}
        <div className="lg:col-span-8 space-y-5">
          {/* Endpoint Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={cn(
                  "text-[10px] font-extrabold px-2 py-0.5 rounded font-mono border",
                  METHOD_COLORS[activeEndpoint.method],
                )}
              >
                {activeEndpoint.method}
              </span>
              <code className="text-xs font-bold font-mono text-slate-600">
                {activeEndpoint.path}
              </code>
            </div>
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold text-slate-900">
                {activeEndpoint.name}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {activeEndpoint.description}
              </p>
            </div>
          </div>

          {/* Scopes */}
          <ScopeBadges scopes={activeEndpoint.scopes} />

          {/* Request Inputs Card */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <SpreadText className="text-xs text-slate-800">
                Request Inputs
              </SpreadText>
              {activeEndpoint.method !== "GET" && (
                <Badge variant="info" className="text-[10px]">
                  {activeEndpoint.method}
                </Badge>
              )}
            </div>

            {/* Path params */}
            {pathParams.length > 0 && (
              <PathParamInputs
                params={pathParams}
                values={pathValues}
                onChange={(name, val) =>
                  setPathValues((prev) => ({ ...prev, [name]: val }))
                }
              />
            )}

            {/* Query params */}
            <QueryParamInputs
              params={queryParams}
              values={queryValues}
              onChange={(name, val) =>
                setQueryValues((prev) => ({ ...prev, [name]: val }))
              }
            />

            {/* Request body */}
            {hasBody && (
              <div className="space-y-2">
                <Label>
                  <SpreadText className="text-xs text-slate-800">
                    Request Body (JSON)
                  </SpreadText>
                </Label>
                <Textarea
                  value={bodyStr}
                  onChange={setBodyStr}
                  rows={8}
                  className="font-mono text-xs"
                  placeholder="{}"
                />
              </div>
            )}

            <Button
              className="w-full justify-center gap-2"
              loadingMessage="Sending request..."
              loading={loading}
              disabled={loading}
              onClick={runPlayground}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Try it Out
            </Button>
          </div>

          {/* Code Snippet */}
          <RequestSnippet
            endpoint={activeEndpoint}
            apiKey={apiKey}
            resolvedPath={resolvedPath}
            bodyStr={bodyStr}
          />

          {/* Response */}
          <ResponseConsole loading={loading} response={response} />
        </div>
      </div>
    </div>
  );
}
