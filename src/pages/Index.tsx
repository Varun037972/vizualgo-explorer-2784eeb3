import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import SupportedLanguages from "@/components/SupportedLanguages";
import TargetUsers from "@/components/TargetUsers";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import ParallaxElements from "@/components/ParallaxElements";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { Navigation } from "@/components/Navigation";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("algoviz-onboarding-completed");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  return (
    <main className="min-h-screen bg-background relative">
      <ScrollProgressBar />
      <AnimatedBackground />
      <ParallaxElements />
      <Navigation />
      <div className="relative z-10">
        <Hero />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <SupportedLanguages />
        <TargetUsers />
        <FinalCTA />
        <Footer />
      </div>
      <ScrollToTopButton />
      <OnboardingTutorial open={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </main>
  );
};

export default Index;
