import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { method, path, body, apiKey } = await req.json();

    // Build the server base URL (strips /backend suffix used by the internal axios client)
    const rawBase =
      process.env.NEXT_PUBLIC_API_URI || "http://localhost:4000/backend";
    const serverBase = rawBase
      .replace(/\/+$/, "")
      .replace(/\/backend$/, "");

    const url = `${serverBase}${path}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
      ...(body != null ? { body: JSON.stringify(body) } : {}),
    };

    const start = Date.now();
    const serverRes = await fetch(url, fetchOptions);
    const elapsed = Date.now() - start;

    let data: unknown;
    const contentType = serverRes.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await serverRes.json();
    } else {
      data = await serverRes.text();
    }

    return NextResponse.json({
      status: serverRes.status,
      statusText: serverRes.statusText,
      data,
      elapsed,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Proxy request failed";
    return NextResponse.json(
      { status: 500, statusText: "Proxy Error", data: { message }, elapsed: 0 },
      { status: 500 },
    );
  }
}
