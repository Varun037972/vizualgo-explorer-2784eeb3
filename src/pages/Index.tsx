import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import SupportedLanguages from "@/components/SupportedLanguages";
import TargetUsers from "@/components/TargetUsers";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

const Index = () => {
  return (
    <main className="min-h-screen bg-background relative">
      <AnimatedBackground />
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
    </main>
  );
};

export default Index;
