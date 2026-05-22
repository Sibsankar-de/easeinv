import {
  ArrowRight,
  Building2,
  BarChart3,
  Clock,
  CreditCard,
  FileText,
  Lock,
  Package,
  Users,
  Zap,
  CheckCircle2,
  TrendingUp,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { TopNav } from "./TopNav";
import { AppLogoFull } from "@/components/ui/AppLogo";

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <TopNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 lg:px-12 py-24 md:py-36 flex flex-col items-center text-center">
          {/* Decorative background elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px] -z-10" />

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            Billing & Inventory,{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-primary to-accent">
              Seamlessly Unified
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Manage invoices, track inventory, handle customer relationships, and
            monitor sales—all from one intuitive workspace. Perfect for growing
            businesses and enterprises.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
            <Link
              href="/auth/signup"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-base font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Start Now
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-lg text-base font-medium bg-secondary/30 hover:bg-secondary/50 border border-border transition-all"
            >
              Explore Features
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 w-full max-w-5xl rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <div className="flex items-center gap-2 p-4 border-b border-border/40 bg-muted/20">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto bg-background/50 rounded-md px-3 py-1 text-xs text-muted-foreground flex items-center gap-2">
                <Lock className="w-3 h-3" />
                easeinv.com/dashboard
              </div>
            </div>
            {/* Dashboard Mockup */}
            <div className="aspect-video w-full bg-linear-to-br from-background via-muted/30 to-background flex items-center justify-center relative overflow-hidden p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full h-full max-w-5xl z-10">
                {/* Left Sidebar */}
                <div className="hidden md:flex flex-col gap-3 h-full">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30">
                    <Layers className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">Dashboard</span>
                  </div>
                  {["Invoices", "Inventory", "Customers"].map((item) => (
                    <div
                      key={item}
                      className="px-3 py-2 rounded-lg bg-card/50 border border-border/30 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main Content */}
                <div className="col-span-1 md:col-span-3 space-y-4">
                  {/* Top Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: "Total Revenue", value: "$28,450", icon: "💰" },
                      { label: "Pending Invoices", value: "12", icon: "📄" },
                      { label: "Active Customers", value: "156", icon: "👥" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="px-3 py-3 rounded-lg bg-card/70 border border-border/40"
                      >
                        <div className="text-lg font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart Area */}
                  <div className="rounded-lg bg-card/70 border border-border/40 p-4">
                    <div className="text-xs font-semibold mb-3 text-foreground">
                      Monthly Revenue
                    </div>
                    <div className="flex items-end gap-1.5 h-20 justify-between pb-2">
                      {[45, 60, 35, 80, 55, 90, 70, 85].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-primary/60 hover:bg-primary/80 transition-colors rounded-t-sm"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="rounded-lg bg-card/70 border border-border/40 p-4">
                    <div className="text-xs font-semibold mb-3 text-foreground">
                      Recent Invoices
                    </div>
                    <div className="space-y-2">
                      {["Invoice #001", "Invoice #002", "Invoice #003"].map(
                        (item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-2 px-2 bg-muted/20 rounded"
                          >
                            <div className="text-xs font-medium">{item}</div>
                            <div className="text-xs text-green-600 font-semibold">
                              Paid
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-24 px-6 lg:px-12 bg-card/50 border-y border-border/40"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                All-in-One Business Management
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From invoicing to inventory, customer management to financial
                insights—everything you need to run and scale your business
                efficiently.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <FileText className="w-6 h-6 text-primary" />,
                  title: "Professional Invoicing",
                  description:
                    "Create customizable invoices in seconds with beautiful templates. Track payment status and send automated reminders to clients.",
                },
                {
                  icon: <Package className="w-6 h-6 text-blue-500" />,
                  title: "Inventory Management",
                  description:
                    "Monitor stock levels in real-time, manage product categories, set up reorder alerts, and track inventory across multiple locations.",
                },
                {
                  icon: <Users className="w-6 h-6 text-purple-500" />,
                  title: "Customer Database",
                  description:
                    "Maintain detailed customer profiles, track purchase history, manage contact information, and build long-term relationships.",
                },
                {
                  icon: <BarChart3 className="w-6 h-6 text-indigo-500" />,
                  title: "Advanced Analytics",
                  description:
                    "Gain insights with real-time dashboards, revenue tracking, profit margins, and sales performance metrics.",
                },
                {
                  icon: <CreditCard className="w-6 h-6 text-green-500" />,
                  title: "Payment Integration",
                  description:
                    "Accept multiple payment methods, automate billing cycles, and reconcile payments with ease.",
                },
                {
                  icon: <Lock className="w-6 h-6 text-teal-500" />,
                  title: "Enterprise Security",
                  description:
                    "Bank-grade encryption, role-based access control, audit logs, and compliance with industry standards.",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="group p-8 rounded-lg bg-background border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-secondary/50 transition-all">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Workflow Simplified
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get your business up and running in minutes, not days.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Set Up Your Business",
                  description:
                    "Create your account, add your business details, and customize your branding in minutes.",
                },
                {
                  step: "02",
                  title: "Add Products & Customers",
                  description:
                    "Import or manually add your products and customer information into the system.",
                },
                {
                  step: "03",
                  title: "Create & Send Invoices",
                  description:
                    "Generate professional invoices and send them directly to clients. Track payments automatically.",
                },
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="text-6xl font-bold text-primary/20 mb-2">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-12 -right-12 w-12 h-0.5 bg-border/50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 px-6 lg:px-12 bg-secondary/10 border-y border-border/40">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16 text-center">
              Why Businesses Choose Us
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "Save Time & Reduce Errors",
                  description:
                    "Automate repetitive billing tasks and eliminate manual data entry mistakes.",
                  icon: <Clock className="w-8 h-8 text-primary" />,
                },
                {
                  title: "Grow Your Revenue",
                  description:
                    "Track cash flow, identify trends, and make data-driven decisions to scale faster.",
                  icon: <TrendingUp className="w-8 h-8 text-green-500" />,
                },
                {
                  title: "Get Paid Faster",
                  description:
                    "Send invoices instantly, track payment status, and reduce payment cycles.",
                  icon: <Zap className="w-8 h-8 text-yellow-500" />,
                },
                {
                  title: "Stay Organized",
                  description:
                    "Keep all business operations in one place—invoices, inventory, and customers.",
                  icon: <Building2 className="w-8 h-8 text-indigo-500" />,
                },
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex gap-6 p-6 rounded-lg bg-background border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Trusted by Businesses
              </h2>
              <p className="text-lg text-muted-foreground">
                See what our users have to say about managing their business
                with us.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "This platform has cut my invoicing time by 80%. I can now focus on growing my business instead of managing paperwork.",
                  author: "Sarah Johnson",
                  role: "Freelance Designer",
                },
                {
                  quote:
                    "The inventory management features are incredibly intuitive. We've reduced stockouts significantly and improved our cash flow.",
                  author: "Mike Chen",
                  role: "Store Manager",
                },
                {
                  quote:
                    "The analytics dashboard gives us insights we never had before. It's been game-changing for our business strategy.",
                  author: "Emma Davis",
                  role: "Business Owner",
                },
              ].map((testimonial, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs text-yellow-900 font-bold"
                      >
                        ★
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 lg:px-12 bg-linear-to-r from-primary/10 via-primary/5 to-secondary/10 border-y border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 -z-10">
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2" />
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join thousands of businesses that have simplified their invoicing
              and inventory management with our platform. Get started today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="group flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-5 rounded-lg text-lg font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Start Now
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center justify-center px-10 py-5 rounded-lg text-lg font-semibold border border-border hover:bg-secondary/20 transition-all"
              >
                Sign In
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-8">
              No credit card required.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <AppLogoFull size={120} />
              </Link>
              <p className="text-muted-foreground max-w-sm">
                Simplifying billing and inventory management for businesses of
                all sizes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Product</h4>
              <ul className="space-y-3">
                {["Features", "Pricing", "Security", "Changelog"].map(
                  (link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Company</h4>
              <ul className="space-y-3">
                {["About", "Blog", "Careers", "Contact"].map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Legal</h4>
              <ul className="space-y-3">
                {["Privacy Policy", "Terms of Service", "Contact Support"].map(
                  (link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50">
            <div className="flex flex-col md:flex-row items-center justify-between text-muted-foreground text-sm">
              <p>
                &copy; {new Date().getFullYear()} BillTrack. All rights
                reserved.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  Twitter
                </Link>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  LinkedIn
                </Link>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
