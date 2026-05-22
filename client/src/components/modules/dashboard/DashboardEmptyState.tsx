import { PrimaryBox } from "@/components/ui/PrimaryBox";

export const EmptyAnalyticsState = () => (
  <PrimaryBox className="border-dashed bg-muted/40">
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-lg font-medium text-foreground">
          No analytics yet
        </h2>
        <p className="text-sm text-muted-foreground">
          Create invoices to populate sales, billing, and product insights.
        </p>
      </div>
    </div>
  </PrimaryBox>
);
