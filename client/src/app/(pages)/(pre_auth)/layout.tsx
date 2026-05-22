import { PreAuthPageLayout } from "@/components/layout/PreAuthPageLayout";
import React from "react";

export default function PreAuthPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PreAuthPageLayout>{children}</PreAuthPageLayout>;
}
