import { AgentShowcase } from "@/components/sections/AgentShowcase";
import { AnalyticsPreview } from "@/components/sections/AnalyticsPreview";
import { Capabilities } from "@/components/sections/Capabilities";
import { CTA } from "@/components/sections/CTA";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Integrations } from "@/components/sections/Integrations";
import { Trust } from "@/components/sections/Trust";
import { UseCases } from "@/components/sections/UseCases";

export default function Home() {
  return (
    <>
      <Hero />
      <Capabilities />
      <AgentShowcase />
      <UseCases />
      <HowItWorks />
      <Integrations />
      <AnalyticsPreview />
      <Trust />
      <CTA />
    </>
  );
}
