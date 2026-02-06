import { FileCode, Play, Search } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion } from "framer-motion";

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
              const isLast = index === steps.length - 1;
              const stepAnimation = useScrollAnimation({ threshold: 0.2 });

              return (
                <motion.div
                  key={index}
                  ref={stepAnimation.ref}
                  initial={{ opacity: 0, y: 20 }}
                  animate={stepAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  {/* Step Card */}
                  <div className="bg-card border border-border hover:border-primary/50 rounded-2xl p-8 space-y-6 transition-all duration-500 hover:shadow-[0_20px_50px_-15px_hsl(var(--primary)/0.3)] relative z-10 overflow-hidden">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-500" />
                    
                    {/* Number Badge */}
                    <motion.div 
                      className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-glow-primary"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {step.number}
                    </motion.div>

                    {/* Icon */}
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl bg-${step.color}/20 flex items-center justify-center relative`}
                      whileHover={{ scale: 1.1, rotate: 3 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className={`absolute inset-0 rounded-2xl bg-${step.color}/20 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                      <Icon className={`h-8 w-8 text-${step.color} relative z-10`} />
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-3 relative z-10">
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                    
                    {/* Bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/50 transition-all duration-500" />
                  </div>

                  {/* Arrow (for mobile) */}
                  {!isLast && (
                    <div className="md:hidden flex justify-center my-4">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-secondary"></div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
