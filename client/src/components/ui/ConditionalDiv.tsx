import React from "react";

export const ConditionalDiv = ({
  condition,
  children,
  ...divProps
}: {
  condition: any;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  if (condition) return <div {...divProps}>{children}</div>;
  else return null;
};
