import { motion } from "framer-motion";

const PageLoader = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation skeleton */}
      <div className="h-16 border-b border-border/50 backdrop-blur-xl bg-background/80 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-8 h-8 rounded-lg bg-primary/20"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="w-24 h-5 rounded bg-muted"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
          />
        </div>
        <div className="hidden md:flex items-center gap-4">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="w-16 h-4 rounded bg-muted"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Animated logo/spinner */}
        <div className="relative mb-8">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 w-16 h-16 rounded-2xl border-2 border-primary/50"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        </div>

        {/* Loading text */}
        <motion.div
          className="flex items-center gap-1 text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-sm font-medium">Loading</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          >.</motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          >.</motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          >.</motion.span>
        </motion.div>

        {/* Content skeleton blocks */}
        <div className="mt-12 w-full max-w-2xl space-y-4">
          <motion.div
            className="h-8 w-3/4 mx-auto rounded-lg bg-muted"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="h-4 w-1/2 mx-auto rounded bg-muted"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          <div className="grid grid-cols-2 gap-4 mt-8">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="h-32 rounded-xl bg-muted"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
