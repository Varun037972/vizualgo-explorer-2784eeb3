import { GraduationCap, Briefcase, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const userTypes = [
  {
    icon: GraduationCap,
    title: "Education",
    subtitle: "Students & Teachers",
    description: "Perfect for computer science courses. Visualize algorithms in lectures and make complex concepts accessible to all learning styles.",
    benefits: ["Interactive learning", "Better retention", "Visual explanations", "Course integration"],
    gradient: "from-primary/10 to-primary/5",
  },
  {
    icon: Briefcase,
    title: "Professional Development",
    subtitle: "Software Engineers",
    description: "Debug complex algorithms faster and optimize performance with visual insights. Essential for code reviews and technical interviews.",
    benefits: ["Faster debugging", "Performance optimization", "Code review tool", "Interview prep"],
    gradient: "from-secondary/10 to-secondary/5",
  },
  {
    icon: Trophy,
    title: "Competitive Programming",
    subtitle: "Algorithm Enthusiasts",
    description: "Analyze solutions from coding competitions, compare approaches, and find edge cases. Improve your problem-solving efficiency.",
    benefits: ["Strategy analysis", "Solution comparison", "Edge case discovery", "Time optimization"],
    gradient: "from-accent/10 to-accent/5",
  },
];

const TargetUsers = () => {
  return (
    <section id="use-cases" className="py-20 bg-card/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <span className="text-sm font-semibold text-accent uppercase tracking-wide">Use Cases</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Who Is This <span className="text-accent">For?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're learning, teaching, or building, our visualizer adapts to your needs
          </p>
        </div>

        {/* User Types Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {userTypes.map((userType, index) => {
            const Icon = userType.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`bg-gradient-to-br ${userType.gradient} border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_20px_50px_-15px_hsl(var(--primary)/0.4)] group h-full relative overflow-hidden cursor-pointer`}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                  
                  <CardContent className="p-8 space-y-6 relative z-10">
                    {/* Icon */}
                    <motion.div 
                      className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-primary relative"
                      whileHover={{ scale: 1.15, rotate: 6 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="absolute inset-0 rounded-2xl bg-primary blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                      <Icon className="h-8 w-8 text-primary-foreground relative z-10" />
                    </motion.div>

                    {/* Title */}
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">{userType.title}</h3>
                      <p className="text-sm text-primary font-medium">{userType.subtitle}</p>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">{userType.description}</p>

                    {/* Benefits */}
                    <div className="space-y-2 pt-4 border-t border-border/50">
                      {userType.benefits.map((benefit, benefitIndex) => (
                        <motion.div 
                          key={benefitIndex} 
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + benefitIndex * 0.05 }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform duration-300"></div>
                          <span className="text-sm text-foreground">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                  
                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/50 transition-all duration-500" />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TargetUsers;
