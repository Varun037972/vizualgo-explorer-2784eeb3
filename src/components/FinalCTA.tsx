import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(193_100%_50%/0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(270_70%_65%/0.15),transparent_50%)]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">Start Your Journey Today</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl md:text-6xl font-bold">
            Ready to Master
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
              Algorithms Visually?
            </span>
          </h2>

          {/* Supporting Text */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Start exploring, debugging, and understanding code execution today.
            Join thousands of learners and developers worldwide.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all shadow-glow-primary hover:shadow-glow-primary hover:scale-105 font-semibold px-10 text-lg group"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 backdrop-blur-sm font-semibold px-10 text-lg"
            >
              View Documentation
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-muted-foreground">
            {[
              "✓ No credit card required",
              "✓ Free for students",
              "✓ Instant setup",
              "✓ All languages included",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12 border-t border-border/50">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-secondary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
