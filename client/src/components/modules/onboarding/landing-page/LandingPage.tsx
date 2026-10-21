import { TopNav } from "./TopNav";
import { Footer } from "@/components/layout/Footer";
import HeroSection from "./HeroSection";
import LogoCloud from "./LogoCloud";
import BentoGrid from "./BentoGrid";
import WorkflowSection from "./WorkflowSection";
import BenefitsGrid from "./BenefitsGrid";
import Testimonials from "./Testimonials";
import FaqSection from "./FaqSection";
import CtaBanner from "./CtaBanner";
import { cn } from "@/components/utils";

export const LandingPage = () => {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col pt-16 bg-background text-foreground",
        "transition-colors duration-300",
      )}
    >
      <TopNav />
      <main className="flex-1">
        <HeroSection />
        <LogoCloud />
        <BentoGrid />
        <WorkflowSection />
        <BenefitsGrid />
        <Testimonials />
        <FaqSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
};
