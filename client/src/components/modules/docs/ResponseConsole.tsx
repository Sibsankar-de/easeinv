"use client";

import { RefreshCw } from "lucide-react";
import { cn } from "../../utils";
import { CodeHighlight } from "./CodeHighlight";
import { SpreadText } from "../../ui/SpreadText";
import { CopyButton } from "./CopyButton";

export interface ProxyResponse {
  status: number;
  statusText: string;
  data: unknown;
  elapsed: number;
}

interface ResponseConsoleProps {
  loading: boolean;
  response: ProxyResponse | null;
}

function statusColor(status: number) {
  if (status >= 200 && status < 300)
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (status >= 400 && status < 500)
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-rose-500/10 text-rose-400 border-rose-500/20";
}

export function ResponseConsole({ loading, response }: ResponseConsoleProps) {
  const responseStr = response
    ? JSON.stringify(response.data, null, 2)
    : null;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0f172a] overflow-hidden shadow-sm">
      <div
        className={cn(
          "flex items-center justify-between",
          "border-b border-slate-800 bg-slate-950/40 px-4 py-2.5",
        )}
      >
        <SpreadText className="text-xs text-slate-200">
          Response Console
        </SpreadText>
        <div className="flex items-center gap-2">
          {response && (
            <>
              <span
                className={cn(
                  "font-mono font-bold text-[10px] px-2 py-0.5 rounded border",
                  statusColor(response.status),
                )}
              >
                {response.status} {response.statusText}
              </span>
              <span className="font-mono text-[10px] text-slate-400 font-semibold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                {response.elapsed} ms
              </span>
              {responseStr && <CopyButton text={responseStr} />}
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div
          className={cn(
            "flex items-center justify-center gap-2",
            "text-slate-400 py-12 bg-slate-900/10 font-mono text-xs",
          )}
        >
          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
          Sending request...
        </div>
      ) : responseStr ? (
        <CodeHighlight
          code={responseStr}
          language="json"
          customStyle={{
            border: "none",
            borderRadius: "0",
            backgroundColor: "transparent",
            padding: "1rem",
          }}
        />
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center",
            "py-12 bg-slate-900/10 text-center space-y-1.5",
          )}
        >
          <span className="text-xs text-slate-500 font-mono">
            {"// Click 'Try it Out' to send a real request"}
          </span>
        </div>
      )}
    </div>
  );
}
