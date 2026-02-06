import { Code2, Flame, Database, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion } from "framer-motion";

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
    <section id="features" className="py-20 bg-background relative overflow-hidden scroll-mt-20">
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
              <motion.div
                key={index}
                ref={featureAnimation.ref}
                initial={{ opacity: 0, y: 20 }}
                animate={featureAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`bg-gradient-to-br ${feature.gradient} border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_20px_50px_-15px_hsl(var(--primary)/0.4)] group cursor-pointer h-full relative overflow-hidden`}
                >
                  {/* Animated gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-accent/5 transition-all duration-700" />
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                  
                  <CardContent className="p-8 space-y-4 relative z-10">
                    <motion.div 
                      className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center relative`}
                      whileHover={{ scale: 1.15, rotate: 6 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {/* Icon glow effect */}
                      <div className={`absolute inset-0 rounded-xl ${feature.iconBg} blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                      <Icon className={`h-7 w-7 ${feature.iconColor} relative z-10 group-hover:drop-shadow-lg transition-all duration-300`} />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300 group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]">
                      {feature.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed group-hover:text-muted-foreground/90 transition-colors duration-300">
                      {feature.description}
                    </p>
                    
                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/50 transition-all duration-500" />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
