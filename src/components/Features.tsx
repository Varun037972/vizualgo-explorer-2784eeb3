import { Code2, Flame, Database, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: Code2,
    title: "Real Code Execution",
    description: "Visualize actual Python, Java & C++ code, not just pseudocode. See variables, loops, and data structures change live as your code runs.",
    gradient: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
  },
  {
    icon: Flame,
    title: "Complexity Heatmap",
    description: "Instantly spot bottlenecks! Visually identify the most time-consuming parts of your code with color-coded performance metrics.",
    gradient: "from-destructive/20 to-destructive/5",
    iconBg: "bg-destructive/20",
    iconColor: "text-destructive",
  },
  {
    icon: Database,
    title: "Memory Visualization",
    description: "Understand memory management like never before. Track stack and heap allocation/deallocation in real-time with intuitive visuals.",
    gradient: "from-accent/20 to-accent/5",
    iconBg: "bg-accent/20",
    iconColor: "text-accent",
  },
  {
    icon: Zap,
    title: "Multi-Algorithm Race Mode",
    description: "Compare algorithms head-to-head. Run different solutions on the same input and see their performance differences visually side-by-side.",
    gradient: "from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/20",
    iconColor: "text-secondary",
  },
];

const Features = () => {
  const headerAnimation = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Animated Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(193_100%_50%/0.1),transparent_50%)] animate-pulse"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(270_70%_65%/0.1),transparent_50%)] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div 
          ref={headerAnimation.ref}
          className={`text-center mb-16 space-y-4 transition-all duration-700 ${
            headerAnimation.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 animate-scale-in">
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">Core Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Unique Features for
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
              Deeper Understanding
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Go beyond traditional algorithm learning with our cutting-edge visualization tools
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const featureAnimation = useScrollAnimation({ threshold: 0.2 });
            
            return (
              <div
                key={index}
                ref={featureAnimation.ref}
                className={`transition-all duration-700 ${
                  featureAnimation.isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Card
                  className={`bg-gradient-to-br ${feature.gradient} border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-glow-primary hover:-translate-y-2 hover:scale-[1.02] group cursor-pointer h-full`}
                >
                  <CardContent className="p-8 space-y-4">
                    <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
