import { HeaderNavbar } from "@/components/modules/navbar/navbar";

export default function GeneralPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <HeaderNavbar />
      {children}
    </div>
  );
}
