import { CapabilityStrip } from "@/components/sections/CapabilityStrip";
import { CaseStudy } from "@/components/sections/CaseStudy";
import { CTA } from "@/components/sections/CTA";
import { DemoPreview } from "@/components/sections/DemoPreview";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Industries } from "@/components/sections/Industries";
import { IndustryExamples } from "@/components/sections/IndustryExamples";
import { Solutions } from "@/components/sections/Solutions";
import { Testimonials } from "@/components/sections/Testimonials";
import { VoiceAgents } from "@/components/sections/VoiceAgents";
import { WhyUs } from "@/components/sections/WhyUs";
import { WhyVoice } from "@/components/sections/WhyVoice";
import { Workflow } from "@/components/sections/Workflow";

export default function Home() {
  return (
    <>
      <Hero />
      <CapabilityStrip />
      <WhyVoice />
      <VoiceAgents />
      <Workflow />
      <Industries />
      <IndustryExamples />
      <DemoPreview />
      <HowItWorks />
      <CaseStudy />
      <Solutions />
      <WhyUs />
      <Testimonials />
      <CTA />
    </>
  );
}
