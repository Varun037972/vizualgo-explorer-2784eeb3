import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-algorithm-bg.jpg";
const Hero = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Login Button - moved to Navigation */}
      
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="Algorithm visualization network" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
      </div>

      {/* Animated Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0099ff15_1px,transparent_1px),linear-gradient(to_bottom,#0099ff15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-primary/20 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-primary animate-glow-pulse"></div>
            <span className="text-sm font-medium text-primary">Next-Gen Algorithm Learning</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Visualize Real Code
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
              Execution, Step-by-Step
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Go beyond pseudocode. Understand algorithms like never before by seeing your{" "}
            <span className="text-primary font-semibold">Python</span>,{" "}
            <span className="text-secondary font-semibold">Java</span>, or{" "}
            <span className="text-accent font-semibold">C++</span> code come alive.
            Debug, optimize, and learn faster.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/visualizer">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all shadow-glow-primary hover:shadow-glow-primary hover:scale-105 font-semibold px-8 group">
                Launch Visualizer Now
                <Play className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 backdrop-blur-sm px-8 group text-center font-bold font-sans">
                Watch Demo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 max-w-4xl mx-auto">
            {[{
            value: "3+",
            label: "Languages"
          }, {
            value: "50+",
            label: "Algorithms"
          }, {
            value: "Real-Time",
            label: "Execution"
          }, {
            value: "100%",
            label: "Visual"
          }].map((stat, index) => <div key={index} className="space-y-2 group cursor-pointer" style={{
            animation: 'fade-in-up 0.6s ease-out',
            animationDelay: `${0.8 + index * 0.1}s`,
            animationFillMode: 'both'
          }}>
                <div className="text-3xl md:text-4xl font-bold text-primary group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">{stat.label}</div>
              </div>)}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>;
};
export default Hero;