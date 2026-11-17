import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Bar with Return Link */}
      <header className="border-b border-border/60 py-4 px-6 sm:px-10 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Store</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 font-bold text-sm tracking-tight">
          <span className="flex size-6 items-center justify-center rounded bg-brand text-brand-foreground text-xs font-semibold">
            S
          </span>
          <span>[STORE_NAME]</span>
        </Link>
      </header>

      {/* Centered Auth Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        {children}
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/40">
        <p>© 2026 [STORE_NAME]. Secured with passwordless OTP authentication.</p>
      </footer>
    </div>
  );
}
