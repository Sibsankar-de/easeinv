import { getStoreConfig } from "@/services";
import { StoreHeader } from "@/components/common/store-header";
import { StoreFooter } from "@/components/common/store-footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await getStoreConfig();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-brand/15 selection:text-brand">
      <StoreHeader
        storeName={store.name}
        announcementText={store.announcementText}
      />
      <main className="flex-1">{children}</main>
      <StoreFooter
        storeName={store.name}
        contactEmail={store.contact.email}
        supportPhone={store.contact.phone}
      />
    </div>
  );
}
