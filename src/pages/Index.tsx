import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import SupportedLanguages from "@/components/SupportedLanguages";
import TargetUsers from "@/components/TargetUsers";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <SupportedLanguages />
      <TargetUsers />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default Index;
