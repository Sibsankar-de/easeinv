import React from "react";
import { DocPageLayout } from "@/components/layout/DocPageLayout";

export default function DocsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocPageLayout>{children}</DocPageLayout>;
}
