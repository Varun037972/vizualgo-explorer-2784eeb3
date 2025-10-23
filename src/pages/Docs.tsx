import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Code2, Rocket, Lightbulb, Video, FileText } from "lucide-react";

const docSections = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Learn the basics of using the visualizer",
    articles: [
      "Quick Start Guide",
      "Your First Visualization",
      "Understanding the Interface",
      "Keyboard Shortcuts",
    ],
  },
  {
    icon: Code2,
    title: "Language Guides",
    description: "Language-specific tips and examples",
    articles: [
      "Python Best Practices",
      "Java Implementation Guide",
      "C++ Memory Management",
      "Syntax Differences",
    ],
  },
  {
    icon: Lightbulb,
    title: "Features",
    description: "Deep dive into powerful features",
    articles: [
      "Complexity Heatmap Guide",
      "Memory Visualization",
      "Race Mode Tutorial",
      "Custom Input Data",
    ],
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Watch and learn with video guides",
    articles: [
      "Introduction to Algorithm Viz",
      "Sorting Algorithms Demo",
      "Graph Algorithms Walkthrough",
      "Advanced Tips & Tricks",
    ],
  },
];

const Docs = () => {
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
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Documentation</span>
            </div>
          </div>
          <Link to="/visualizer">
            <Button className="bg-gradient-primary text-primary-foreground">
              Launch Visualizer
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Comprehensive Guides</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Learn to Master
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">Algorithm Visualization</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about using the Advanced Algorithm Visualizer effectively
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <Card className="border-primary/30 hover:border-primary/50 transition-all cursor-pointer hover:shadow-glow-primary">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Quick Start</h3>
                <p className="text-sm text-muted-foreground">Get up and running in 5 minutes</p>
              </CardContent>
            </Card>

            <Card className="border-secondary/30 hover:border-secondary/50 transition-all cursor-pointer">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mx-auto">
                  <Code2 className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold">API Reference</h3>
                <p className="text-sm text-muted-foreground">Detailed API documentation</p>
              </CardContent>
            </Card>

            <Card className="border-accent/30 hover:border-accent/50 transition-all cursor-pointer">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto">
                  <Video className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold">Video Tutorials</h3>
                <p className="text-sm text-muted-foreground">Learn by watching</p>
              </CardContent>
            </Card>
          </div>

          {/* Documentation Sections */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {docSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card key={index} className="hover:border-primary/30 transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                        <CardDescription className="text-sm">{section.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.articles.map((article, articleIndex) => (
                        <li key={articleIndex}>
                          <a
                            href="#"
                            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors group"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform"></div>
                            <span>{article}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community or reach out to our support team for assistance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline">Join Community</Button>
            <Button size="lg" className="bg-gradient-primary text-primary-foreground">
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Docs;
