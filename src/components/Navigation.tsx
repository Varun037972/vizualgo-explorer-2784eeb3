import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, Home, BookOpen, PlayCircle, LogIn, LogOut, Menu, GraduationCap, Briefcase, Brain, Trophy, BarChart3, Shield, LayoutDashboard, User, Settings, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

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

type NavItem = { label: string; to: string; icon: React.ReactNode };

const studentLinks: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "AI Tutor", to: "/ai-tutor", icon: <Brain className="h-4 w-4" /> },
  { label: "Learn", to: "/learn", icon: <GraduationCap className="h-4 w-4" /> },
  { label: "Quiz", to: "/quiz", icon: <Trophy className="h-4 w-4" /> },
  { label: "Placement", to: "/placement", icon: <Briefcase className="h-4 w-4" /> },
  { label: "Analytics", to: "/analytics", icon: <BarChart3 className="h-4 w-4" /> },
];

const facultyLinks: NavItem[] = [
  { label: "Faculty Panel", to: "/faculty", icon: <Shield className="h-4 w-4" /> },
  { label: "Analytics", to: "/analytics", icon: <BarChart3 className="h-4 w-4" /> },
];

const publicLinks: NavItem[] = [
  { label: "Demo", to: "/demo", icon: <PlayCircle className="h-4 w-4" /> },
  { label: "Docs", to: "/docs", icon: <BookOpen className="h-4 w-4" /> },
];

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { role, userId, isFaculty, loading } = useUserRole();

  const roleLinks = isFaculty ? facultyLinks : studentLinks;
  const navLinks = userId ? [...roleLinks, ...publicLinks] : publicLinks;

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      window.location.href = `/#${sectionId}`;
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const linkClass = "flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium";
  const mobileLinkClass = "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-all";

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

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <button onClick={() => scrollToSection("hero")}>
                <NavigationMenuLink className={linkClass + " cursor-pointer"}>
                  <Home className="h-4 w-4" />
                  Home
                </NavigationMenuLink>
              </button>
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
                                  <span className="group-hover:text-primary transition-colors font-medium">{item.name}</span>
                                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{item.complexity}</span>
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

            {navLinks.map((item) => (
              <NavigationMenuItem key={item.to}>
                <Link to={item.to}>
                  <NavigationMenuLink className={linkClass}>
                    {item.icon}
                    {item.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}

            {isHome && (
              <>
                <NavigationMenuItem>
                  <button onClick={() => scrollToSection("features")}>
                    <NavigationMenuLink className={linkClass + " cursor-pointer"}>Features</NavigationMenuLink>
                  </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <button onClick={() => scrollToSection("how-it-works")}>
                    <NavigationMenuLink className={linkClass + " cursor-pointer"}>How It Works</NavigationMenuLink>
                  </button>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop Right Side */}
        <div className="hidden lg:flex items-center gap-3">
          {userId ? (
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10">
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Button>
            </Link>
          )}
          {!isHome && (
            <Link to="/visualizer">
              <Button variant="glow" size="default" className="gap-2">
                <PlayCircle className="h-4 w-4" />
                Launch Visualizer
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-card/95 backdrop-blur-xl border-border/50">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Code2 className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">AlgoViz</span>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-2">
              <button onClick={() => scrollToSection("hero")} className={mobileLinkClass + " text-left"}>
                <Home className="h-5 w-5 text-primary" />
                <span className="font-medium">Home</span>
              </button>

              {navLinks.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>
                  <span className="text-primary">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              {isHome && (
                <>
                  <div className="h-px bg-border/50 my-2" />
                  {["features", "how-it-works", "use-cases"].map((id) => (
                    <button key={id} onClick={() => scrollToSection(id)} className={mobileLinkClass + " text-left"}>
                      <span className="font-medium text-muted-foreground capitalize">{id.replace(/-/g, " ")}</span>
                    </button>
                  ))}
                </>
              )}

              <div className="h-px bg-border/50 my-2" />

              {userId ? (
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className={mobileLinkClass}>
                  <LogOut className="h-5 w-5 text-primary" />
                  <span className="font-medium">Logout</span>
                </button>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>
                  <LogIn className="h-5 w-5 text-primary" />
                  <span className="font-medium">Login</span>
                </Link>
              )}

              <Link to="/visualizer" onClick={() => setMobileMenuOpen(false)} className="mt-4">
                <Button variant="glow" className="w-full gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Launch Visualizer
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
