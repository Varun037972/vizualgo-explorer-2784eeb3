import { AlertTriangle, Lightbulb } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const ProblemSolution = () => {
  const headerAnimation = useScrollAnimation({ threshold: 0.2 });
  const problemAnimation = useScrollAnimation({ threshold: 0.2 });
  const solutionAnimation = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <section id="problem-solution" className="py-20 bg-card/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div 
            ref={headerAnimation.ref}
            className={`text-center mb-16 space-y-4 transition-all duration-700 ${
              headerAnimation.isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              Tired of <span className="text-destructive">Abstract Theory</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Static diagrams and pseudocode can't capture how algorithms truly behave across different inputs
            </p>
          </div>

          {/* Problem & Solution Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem Card */}
            <div 
              ref={problemAnimation.ref}
              className={`bg-card border border-destructive/20 rounded-2xl p-8 space-y-6 hover:border-destructive/40 transition-all duration-700 hover:-translate-y-2 ${
                problemAnimation.isVisible 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold">The Challenge</h3>
              </div>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1">•</span>
                  <span>Students struggle to connect theoretical algorithms to actual code performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1">•</span>
                  <span>Debugging complex algorithms feels like navigating in the dark</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1">•</span>
                  <span>Memory and time complexity remain abstract concepts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1">•</span>
                  <span>No visibility into what happens inside the code during execution</span>
                </li>
              </ul>
            </div>

            {/* Solution Card */}
            <div 
              ref={solutionAnimation.ref}
              className={`bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 rounded-2xl p-8 space-y-6 hover:border-primary/50 transition-all duration-700 shadow-glow-primary hover:-translate-y-2 hover:scale-[1.02] ${
                solutionAnimation.isVisible 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 translate-x-10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
                  <Lightbulb className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Our Solution</h3>
              </div>
              <div className="space-y-4">
                <p className="text-lg font-semibold text-primary">
                  Make algorithms tangible and interactive
                </p>
                <ul className="space-y-4 text-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>Visualize <strong>real code execution</strong>, not just theory</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>See variables, loops, and data structures <strong>change live</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>Identify bottlenecks with <strong>complexity heatmaps</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>Track memory allocation and deallocation in <strong>real-time</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
