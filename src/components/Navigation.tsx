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
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center animate-glow-pulse">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AlgoViz
          </span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className="flex items-center gap-2 px-4 py-2 hover:text-primary transition-colors">
                  <Home className="h-4 w-4" />
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Algorithms
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 w-[600px] md:grid-cols-2">
                  {algorithmCategories.map((category) => (
                    <div key={category.title} className="space-y-2">
                      <h3 className="font-semibold text-sm text-primary">{category.title}</h3>
                      <ul className="space-y-1">
                        {category.items.map((item) => (
                          <li key={item.name}>
                            <Link to="/visualizer">
                              <button className="w-full text-left text-sm py-1.5 px-2 rounded hover:bg-accent/10 transition-colors group">
                                <div className="flex items-center justify-between">
                                  <span className="group-hover:text-primary transition-colors">
                                    {item.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
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
                <NavigationMenuLink className="flex items-center gap-2 px-4 py-2 hover:text-primary transition-colors">
                  <PlayCircle className="h-4 w-4" />
                  Demo
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/docs">
                <NavigationMenuLink className="flex items-center gap-2 px-4 py-2 hover:text-primary transition-colors">
                  <BookOpen className="h-4 w-4" />
                  Docs
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              <span className="hidden md:inline">Login</span>
            </Button>
          </Link>
          {!isHome && (
            <Link to="/visualizer">
              <Button className="bg-gradient-primary hover:shadow-glow-primary transition-all gap-2">
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
