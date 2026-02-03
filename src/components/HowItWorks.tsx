import { FileCode, Play, Search } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const steps = [
  {
    icon: FileCode,
    number: "01",
    title: "Input Your Code",
    description: "Write or paste your algorithm in Python, Java, or C++. Our intelligent parser prepares your code for visualization.",
    color: "primary",
  },
  {
    icon: Play,
    number: "02",
    title: "Visualize Execution",
    description: "Watch your code come alive! See each line execute, variables update, and data structures transform in real-time.",
    color: "secondary",
  },
  {
    icon: Search,
    number: "03",
    title: "Analyze & Learn",
    description: "Examine complexity heatmaps, memory patterns, and performance metrics. Understand exactly how your algorithm behaves.",
    color: "accent",
  },
];

const HowItWorks = () => {
  const headerAnimation = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <section id="how-it-works" className="py-20 bg-card/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div 
          ref={headerAnimation.ref}
          className={`text-center mb-16 space-y-4 transition-all duration-700 ${
            headerAnimation.isVisible 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
        >
          <div className="inline-block px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
            <span className="text-sm font-semibold text-secondary uppercase tracking-wide">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-secondary bg-clip-text text-transparent">Simple Steps</span> to Insight
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get started in seconds and unlock deep understanding of your algorithms
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-30"></div>

            {steps.map((step, index) => {
              const Icon = step.icon;
              const isFirst = index === 0;
              const isLast = index === steps.length - 1;
              const stepAnimation = useScrollAnimation({ threshold: 0.2 });

              return (
                <div
                  key={index}
                  ref={stepAnimation.ref}
                  className={`relative group transition-all duration-700 ${
                    stepAnimation.isVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Step Card */}
                  <div className="bg-card border border-border hover:border-primary/30 rounded-2xl p-8 space-y-6 transition-all duration-500 hover:shadow-glow-primary hover:-translate-y-2 hover:scale-[1.02] relative z-10">
                    {/* Number Badge */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-glow-primary">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-${step.color}/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-8 w-8 text-${step.color}`} />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  {/* Arrow (for mobile) */}
                  {!isLast && (
                    <div className="md:hidden flex justify-center my-4">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-secondary"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
