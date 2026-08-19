"use client";

import { useState } from "react";
import { Terminal } from "lucide-react";
import { cn } from "../../utils";
import { CodeHighlight } from "./CodeHighlight";
import { CopyButton } from "./CopyButton";
import { ApiEndpoint } from "@/lib/api-explorer/endpoints";
import { SpreadText } from "../../ui/SpreadText";

type CodeLang = "curl" | "javascript" | "python";

interface RequestSnippetProps {
  endpoint: ApiEndpoint;
  apiKey: string;
  resolvedPath: string; // path with :params already substituted + query string appended
  bodyStr: string;      // current request body JSON string
}

function buildSnippet(
  endpoint: ApiEndpoint,
  lang: CodeLang,
  apiKey: string,
  resolvedPath: string,
  bodyStr: string,
): string {
  const BASE = "https://api.easeinv.com";
  const url = `${BASE}${resolvedPath}`;
  const hasBody = ["POST", "PATCH"].includes(endpoint.method);
  const bodyFormatted = bodyStr || "{}";

  if (lang === "curl") {
    const methodFlag =
      endpoint.method === "GET" ? "" : `-X ${endpoint.method} `;
    const headerLine = `-H "Authorization: Bearer ${apiKey}"`;
    const contentHeader = hasBody ? ` \\\n  -H "Content-Type: application/json"` : "";
    const bodyLine = hasBody
      ? ` \\\n  -d '${bodyFormatted.replace(/\n/g, "\n  ")}'`
      : "";
    return `curl ${methodFlag}"${url}" \\\n  ${headerLine}${contentHeader}${bodyLine}`;
  }

  if (lang === "javascript") {
    const methodProp =
      endpoint.method === "GET" ? "" : `\n  method: '${endpoint.method}',`;
    const bodyProp = hasBody
      ? `\n  body: JSON.stringify(${bodyFormatted.replace(/\n/g, "\n  ")}),`
      : "";
    const contentTypeProp = hasBody
      ? `\n    'Content-Type': 'application/json',`
      : "";
    return `fetch('${url}', {${methodProp}
  headers: {
    'Authorization': 'Bearer ${apiKey}',${contentTypeProp}
  },${bodyProp}
})
  .then(res => res.json())
  .then(data => console.log(data));`;
  }

  if (lang === "python") {
    const method = endpoint.method.toLowerCase();
    const bodyArg = hasBody ? `, json=${bodyFormatted}` : "";
    return `import requests

url = "${url}"
headers = {
    "Authorization": "Bearer ${apiKey}",${hasBody ? '\n    "Content-Type": "application/json",' : ""}
}

response = requests.${method}(url, headers=headers${bodyArg})
print(response.json())`;
  }

  return "";
}

export function RequestSnippet({
  endpoint,
  apiKey,
  resolvedPath,
  bodyStr,
}: RequestSnippetProps) {
  const [codeLang, setCodeLang] = useState<CodeLang>("curl");

  const codeSnippet = buildSnippet(endpoint, codeLang, apiKey, resolvedPath, bodyStr);

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0f172a] overflow-hidden shadow-sm">
      <div
        className={cn(
          "flex items-center justify-between",
          "border-b border-slate-800 bg-slate-950/40 px-4 py-2.5",
        )}
      >
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <SpreadText className="text-xs text-slate-200">
            Request Snippet
          </SpreadText>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {(["curl", "javascript", "python"] as CodeLang[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setCodeLang(lang)}
                className={cn(
                  "text-[10px] px-2.5 py-1 rounded font-semibold transition-all capitalize cursor-pointer",
                  codeLang === lang
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                {lang === "javascript" ? "JS fetch" : lang}
              </button>
            ))}
          </div>
          <CopyButton text={codeSnippet} />
        </div>
      </div>

      <CodeHighlight
        code={codeSnippet}
        language={
          codeLang === "javascript"
            ? "javascript"
            : codeLang === "python"
              ? "python"
              : "bash"
        }
        customStyle={{
          border: "none",
          borderRadius: "0",
          backgroundColor: "transparent",
          padding: "1rem",
        }}
      />
    </div>
  );
}
