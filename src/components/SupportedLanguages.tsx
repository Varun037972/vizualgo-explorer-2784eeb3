import { Code } from "lucide-react";
import { motion } from "framer-motion";

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
    <section id="languages" className="py-20 bg-background relative overflow-hidden scroll-mt-20">
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
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative bg-gradient-to-br ${language.color} border ${language.borderColor} rounded-2xl p-8 hover:shadow-[0_20px_50px_-15px_hsl(var(--primary)/0.4)] transition-all cursor-pointer overflow-hidden`}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
              
              {/* Language Icon */}
              <motion.div 
                className="text-6xl mb-4"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {language.icon}
              </motion.div>

              {/* Language Name */}
              <h3 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">{language.name}</h3>

              {/* Features */}
              <ul className="space-y-2">
                {language.features.map((feature, featureIndex) => (
                  <motion.li 
                    key={featureIndex} 
                    className="flex items-center gap-2 text-muted-foreground"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + featureIndex * 0.05 }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform duration-300"></div>
                    <span className="text-sm">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Badge */}
              <motion.div 
                className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/20 border border-primary/30"
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-xs font-semibold text-primary">Supported</span>
              </motion.div>
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/50 transition-all duration-500" />
            </motion.div>
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
