import React from "react";

export function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="p-8 max-w-7xl mx-auto max-md:p-4">{children}</div>;
}

export function StorePageContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mt-3 sm:mt-5 mb-6 sm:mb-10 mx-3 sm:mx-6">{children}</div>;
}
