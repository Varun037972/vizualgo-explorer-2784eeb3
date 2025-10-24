import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Code2, ArrowRight } from "lucide-react";

const demos = [
  {
    title: "Bubble Sort",
    description: "Watch how bubble sort compares and swaps adjacent elements to sort an array",
    language: "Python",
    complexity: "O(n²)",
    difficulty: "Beginner",
  },
  {
    title: "Quick Sort",
    description: "See the divide-and-conquer approach with partitioning and recursive sorting",
    language: "Java",
    complexity: "O(n log n)",
    difficulty: "Intermediate",
  },
  {
    title: "Binary Search",
    description: "Visualize how binary search efficiently finds elements in sorted arrays",
    language: "C++",
    complexity: "O(log n)",
    difficulty: "Beginner",
  },
  {
    title: "Merge Sort",
    description: "Explore the divide-and-conquer strategy with splitting and merging subarrays",
    language: "Python",
    complexity: "O(n log n)",
    difficulty: "Intermediate",
  },
  {
    title: "Dijkstra's Algorithm",
    description: "Find shortest paths in graphs with weighted edges step-by-step",
    language: "Java",
    complexity: "O(V²)",
    difficulty: "Advanced",
  },
  {
    title: "Dynamic Programming - Fibonacci",
    description: "See how memoization optimizes recursive calculations",
    language: "Python",
    complexity: "O(n)",
    difficulty: "Intermediate",
  },
];

const Demo = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Demo Gallery</span>
            </div>
          </div>
          <Link to="/visualizer">
            <Button className="bg-gradient-primary text-primary-foreground">
              Try Visualizer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore <span className="text-primary">Algorithm Demos</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how different algorithms work with pre-built examples. Click any demo to watch it in action.
          </p>
        </div>
      </section>

      {/* Demo Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {demos.map((demo, index) => (
              <Link key={index} to="/visualizer">
                <Card className="hover:border-primary/50 transition-all hover:shadow-glow-primary group cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        demo.difficulty === "Beginner" ? "bg-secondary/20 text-secondary" :
                        demo.difficulty === "Intermediate" ? "bg-primary/20 text-primary" :
                        "bg-accent/20 text-accent"
                      }`}>
                        {demo.difficulty}
                      </div>
                      <div className="text-xs text-muted-foreground">{demo.language}</div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {demo.title}
                    </CardTitle>
                    <CardDescription className="text-sm">{demo.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Time: </span>
                        <span className="font-mono font-semibold">{demo.complexity}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="group-hover:bg-primary/10">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Try Your Own Code?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Launch the visualizer and see your algorithms come to life with real-time execution
          </p>
          <Link to="/visualizer">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow-primary">
              Launch Visualizer
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Demo;
