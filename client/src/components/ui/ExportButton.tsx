"use client";

import * as React from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import {
  DropdownButton,
  DropdownMenuItem,
} from "@/components/ui/DropdownButton";

export interface ExportButtonProps {
  onExport: (format: "xlsx" | "csv") => Promise<void> | void;
  loading?: boolean;
  label?: string;
  variant?: "primary" | "outline" | "secondary" | "dark";
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  loading = false,
  label = "Download XL",
  variant = "outline",
  className = "",
}) => {
  const items: DropdownMenuItem[] = [
    {
      key: "xlsx",
      label: "Export Excel (.xlsx)",
      icon: <FileSpreadsheet size={15} />,
      onClick: () => onExport("xlsx"),
    },
    {
      key: "csv",
      label: "Export CSV (.csv)",
      icon: <FileText size={15} />,
      onClick: () => onExport("csv"),
    },
  ];

  return (
    <DropdownButton
      variant={variant}
      loading={loading}
      loadingMessage="Exporting..."
      onClick={() => onExport("xlsx")}
      items={items}
      className={className}
      tooltip="Download Excel (.xlsx)"
    >
      <Download size={15} />
      <span>{label}</span>
    </DropdownButton>
  );
};
