import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code2 } from "lucide-react";
import { SortingVisualizer } from "@/components/visualizer/SortingVisualizer";

const Visualizer = () => {
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
              <span className="text-xl font-bold">Algorithm Visualizer</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Sorting Algorithm Visualizer</h1>
          <p className="text-muted-foreground">
            Watch sorting algorithms in action with step-by-step visualization
          </p>
        </div>
        
        <SortingVisualizer />
      </div>
    </div>
  );
};

export default Visualizer;
