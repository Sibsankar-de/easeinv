import { PrivatePageLayout } from "@/components/layout/PrivatePageLayout";
import React from "react";

export default function PrivatePagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivatePageLayout>{children}</PrivatePageLayout>;
}
