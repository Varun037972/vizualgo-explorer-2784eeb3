import { useParallax } from "@/hooks/useParallax";

const ParallaxElements = () => {
  const { getParallaxStyle, scrollY } = useParallax();

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Slow-moving large orbs */}
      <div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
          ...getParallaxStyle(-0.15),
        }}
      />
      <div
        className="absolute top-[40vh] -right-48 w-[600px] h-[600px] rounded-full opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)",
          ...getParallaxStyle(-0.08),
        }}
      />
      <div
        className="absolute top-[120vh] -left-24 w-[400px] h-[400px] rounded-full opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)",
          ...getParallaxStyle(-0.12),
        }}
      />

      {/* Medium-speed geometric shapes */}
      <div
        className="absolute top-[20vh] left-[10%] w-20 h-20 border border-primary/10 rounded-lg"
        style={{
          ...getParallaxStyle(-0.25),
          transform: `translateY(${scrollY * -0.25}px) rotate(${scrollY * 0.03}deg)`,
        }}
      />
      <div
        className="absolute top-[60vh] right-[15%] w-16 h-16 border border-secondary/10 rounded-full"
        style={{
          ...getParallaxStyle(-0.18),
          transform: `translateY(${scrollY * -0.18}px) rotate(${scrollY * -0.05}deg)`,
        }}
      />
      <div
        className="absolute top-[90vh] left-[20%] w-12 h-12 border border-accent/15 rounded-md"
        style={{
          transform: `translateY(${scrollY * -0.3}px) rotate(${45 + scrollY * 0.04}deg)`,
        }}
      />
      <div
        className="absolute top-[150vh] right-[25%] w-24 h-24 border border-primary/10 rounded-xl"
        style={{
          transform: `translateY(${scrollY * -0.2}px) rotate(${scrollY * -0.02}deg)`,
        }}
      />

      {/* Fast-moving small dots */}
      {[
        { top: "15vh", left: "80%", speed: -0.35, size: 6 },
        { top: "45vh", left: "5%", speed: -0.4, size: 4 },
        { top: "70vh", left: "90%", speed: -0.3, size: 5 },
        { top: "100vh", left: "50%", speed: -0.45, size: 3 },
        { top: "130vh", left: "75%", speed: -0.35, size: 5 },
        { top: "160vh", left: "15%", speed: -0.28, size: 4 },
      ].map((dot, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/20"
          style={{
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            transform: `translateY(${scrollY * dot.speed}px)`,
          }}
        />
      ))}

      {/* Floating code brackets — fastest layer */}
      <div
        className="absolute top-[30vh] left-[70%] text-primary/[0.06] text-7xl font-mono select-none"
        style={{
          transform: `translateY(${scrollY * -0.5}px)`,
        }}
      >
        {"{ }"}
      </div>
      <div
        className="absolute top-[80vh] left-[8%] text-secondary/[0.06] text-6xl font-mono select-none"
        style={{
          transform: `translateY(${scrollY * -0.45}px) rotate(${scrollY * 0.02}deg)`,
        }}
      >
        {"< />"}
      </div>
      <div
        className="absolute top-[140vh] right-[10%] text-accent/[0.06] text-5xl font-mono select-none"
        style={{
          transform: `translateY(${scrollY * -0.38}px)`,
        }}
      >
        {"[ ]"}
      </div>
    </div>
  );
};

export default ParallaxElements;
