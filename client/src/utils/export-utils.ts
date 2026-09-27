import api from "@/configs/axios-config";
import { toast } from "@/utils/toast";

export interface ExportOptions {
  endpoint: string;
  params?: Record<string, any>;
  defaultFilename: string;
  format?: "xlsx" | "csv";
}

export const downloadExportFile = async ({
  endpoint,
  params = {},
  defaultFilename,
  format = "xlsx",
}: ExportOptions): Promise<boolean> => {
  try {
    const queryParams: Record<string, any> = {
      format,
      ...params,
    };

    // Clean up empty/undefined/null query parameters
    Object.keys(queryParams).forEach((key) => {
      if (
        queryParams[key] === undefined ||
        queryParams[key] === null ||
        queryParams[key] === ""
      ) {
        delete queryParams[key];
      }
    });

    const response = await api.get(endpoint, {
      params: queryParams,
      responseType: "blob",
    });

    // Handle possible JSON error responses returned as blob
    if (response.data?.type === "application/json") {
      const text = await response.data.text();
      try {
        const json = JSON.parse(text);
        toast.error(json.message || "Failed to export data");
        return false;
      } catch {
        // Not a JSON payload
      }
    }

    // Determine filename from Content-Disposition header if available
    let filename = defaultFilename;
    const disposition = response.headers["content-disposition"];
    if (disposition && disposition.includes("filename=")) {
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    const mimeType =
      format === "xlsx"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "text/csv;charset=utf-8;";

    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success("File downloaded successfully");
    return true;
  } catch (error: any) {
    console.error("Export error:", error);
    let errorMessage = "Failed to download export file";
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        if (json.message) errorMessage = json.message;
      } catch {
        // Fallback
      }
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    toast.error(errorMessage);
    return false;
  }
};
