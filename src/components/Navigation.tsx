import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, Home, BookOpen, PlayCircle, HelpCircle, LogIn } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const algorithmCategories = [
  {
    title: "Sorting Algorithms",
    items: [
      { name: "Bubble Sort", complexity: "O(n²)" },
      { name: "Quick Sort", complexity: "O(n log n)" },
      { name: "Merge Sort", complexity: "O(n log n)" },
      { name: "Insertion Sort", complexity: "O(n²)" },
      { name: "Selection Sort", complexity: "O(n²)" },
    ],
  },
  {
    title: "Tree Structures",
    items: [
      { name: "Binary Search Tree", complexity: "O(log n)" },
      { name: "AVL Tree", complexity: "O(log n)" },
      { name: "Red-Black Tree", complexity: "O(log n)" },
      { name: "Heap", complexity: "O(log n)" },
      { name: "Trie", complexity: "O(m)" },
    ],
  },
  {
    title: "Graph Algorithms",
    items: [
      { name: "DFS", complexity: "O(V+E)" },
      { name: "BFS", complexity: "O(V+E)" },
      { name: "Dijkstra", complexity: "O(E log V)" },
      { name: "Bellman-Ford", complexity: "O(VE)" },
    ],
  },
];

export const Navigation = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-background/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-105">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AlgoViz
          </span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium">
                  <Home className="h-4 w-4" />
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-primary/10 font-medium">
                <Code2 className="h-4 w-4" />
                Algorithms
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-4 p-6 w-[600px] md:grid-cols-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl">
                  {algorithmCategories.map((category) => (
                    <div key={category.title} className="space-y-3">
                      <h3 className="font-bold text-sm text-primary border-b border-primary/20 pb-2">{category.title}</h3>
                      <ul className="space-y-1">
                        {category.items.map((item) => (
                          <li key={item.name}>
                            <Link to="/visualizer">
                              <button className="w-full text-left text-sm py-2 px-3 rounded-lg hover:bg-primary/10 transition-all duration-300 group">
                                <div className="flex items-center justify-between">
                                  <span className="group-hover:text-primary transition-colors font-medium">
                                    {item.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                    {item.complexity}
                                  </span>
                                </div>
                              </button>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/demo">
                <NavigationMenuLink className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium">
                  <PlayCircle className="h-4 w-4" />
                  Demo
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/docs">
                <NavigationMenuLink className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium">
                  <BookOpen className="h-4 w-4" />
                  Docs
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10">
              <LogIn className="h-4 w-4" />
              <span className="hidden md:inline">Login</span>
            </Button>
          </Link>
          {!isHome && (
            <Link to="/visualizer">
              <Button variant="glow" size="default" className="gap-2">
                <PlayCircle className="h-4 w-4" />
                <span className="hidden md:inline">Launch Visualizer</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
