import { Code } from "lucide-react";

const languages = [
  {
    name: "Python",
    icon: "🐍",
    color: "from-[#3776ab]/20 to-[#ffd343]/20",
    borderColor: "border-[#3776ab]/30",
    features: ["Dynamic typing", "Rich libraries", "Beginner-friendly"],
  },
  {
    name: "Java",
    icon: "☕",
    color: "from-[#007396]/20 to-[#f89820]/20",
    borderColor: "border-[#007396]/30",
    features: ["Object-oriented", "Platform independent", "Enterprise-ready"],
  },
  {
    name: "C++",
    icon: "⚡",
    color: "from-[#00599c]/20 to-[#659ad2]/20",
    borderColor: "border-[#00599c]/30",
    features: ["High performance", "System programming", "Fine control"],
  },
];

const SupportedLanguages = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(193_100%_50%/0.05),transparent_70%)]"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Code className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">Multi-Language</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Supports the Languages
            <br />
            <span className="text-primary">You Use</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Write in your preferred language and see it visualized instantly
          </p>
        </div>

        {/* Languages Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {languages.map((language, index) => (
            <div
              key={index}
              className={`group relative bg-gradient-to-br ${language.color} border ${language.borderColor} rounded-2xl p-8 hover:shadow-glow-primary transition-all cursor-pointer hover:-translate-y-2`}
            >
              {/* Language Icon */}
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{language.icon}</div>

              {/* Language Name */}
              <h3 className="text-3xl font-bold mb-4">{language.name}</h3>

              {/* Features */}
              <ul className="space-y-2">
                {language.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
                <span className="text-xs font-semibold text-primary">Supported</span>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#3776ab] to-[#ffd343] border-2 border-card"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#007396] to-[#f89820] border-2 border-card"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00599c] to-[#659ad2] border-2 border-card"></div>
            </div>
            <span className="text-muted-foreground">More languages coming soon</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportedLanguages;
