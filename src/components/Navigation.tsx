import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Code2, Home, BookOpen, PlayCircle, LogIn, LogOut, Menu, X,
  GraduationCap, Briefcase, Brain, Trophy, BarChart3, Shield,
  LayoutDashboard, User, ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

type NavItem = { label: string; to: string; icon: React.ReactNode };

const studentLinks: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "AI Tutor", to: "/ai-tutor", icon: <Brain className="h-4 w-4" /> },
  { label: "Learn", to: "/learn", icon: <GraduationCap className="h-4 w-4" /> },
  { label: "Quiz", to: "/quiz", icon: <Trophy className="h-4 w-4" /> },
  { label: "Placement", to: "/placement", icon: <Briefcase className="h-4 w-4" /> },
  { label: "Analytics", to: "/analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Demo", to: "/demo", icon: <PlayCircle className="h-4 w-4" /> },
  { label: "Docs", to: "/docs", icon: <BookOpen className="h-4 w-4" /> },
];

const facultyLinks: NavItem[] = [
  { label: "Faculty Panel", to: "/faculty", icon: <Shield className="h-4 w-4" /> },
  { label: "Analytics", to: "/analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Demo", to: "/demo", icon: <PlayCircle className="h-4 w-4" /> },
  { label: "Docs", to: "/docs", icon: <BookOpen className="h-4 w-4" /> },
];

const publicLinks: NavItem[] = [
  { label: "Demo", to: "/demo", icon: <PlayCircle className="h-4 w-4" /> },
  { label: "Docs", to: "/docs", icon: <BookOpen className="h-4 w-4" /> },
];

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, userId, isFaculty } = useUserRole();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) setEmail(session.user.email);
      });
    } else {
      setEmail(null);
    }
  }, [userId]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const links = userId ? (isFaculty ? facultyLinks : studentLinks) : publicLinks;

  // Split into visible (first 3) and overflow for desktop
  const visibleLinks = links.slice(0, 3);
  const overflowLinks = links.slice(3);

  const scrollToSection = (sectionId: string) => {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      window.location.href = `/#${sectionId}`;
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLogout = async () => {
    setMobileOpen(false);
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-background/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
            <Code2 className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:inline">
            AlgoViz
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center min-w-0">
          {isHome && (
            <button
              onClick={() => scrollToSection("hero")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all whitespace-nowrap"
            >
              <Home className="h-4 w-4" />
              Home
            </button>
          )}

          {visibleLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive(item.to)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          {overflowLinks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all whitespace-nowrap">
                  <Menu className="h-4 w-4" />
                  More
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {overflowLinks.map((item) => (
                  <DropdownMenuItem
                    key={item.to}
                    onClick={() => navigate(item.to)}
                    className={`gap-2 cursor-pointer ${isActive(item.to) ? "text-primary" : ""}`}
                  >
                    {item.icon}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isHome && (
            <>
              <button
                onClick={() => scrollToSection("features")}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all whitespace-nowrap"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all whitespace-nowrap"
              >
                How It Works
              </button>
            </>
          )}
        </div>

        {/* Desktop right side */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {userId ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-1.5 pb-2">
                  <span className="text-sm font-medium truncate">{email ?? "Loading..."}</span>
                  <Badge variant={isFaculty ? "default" : "secondary"} className="w-fit gap-1.5 text-xs">
                    {isFaculty ? <Shield className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
                    {isFaculty ? "Faculty" : "Student"}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="gap-2 cursor-pointer">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analytics")} className="gap-2 cursor-pointer">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
          )}

          {!isHome && (
            <Link to="/visualizer">
              <Button variant="glow" size="sm" className="gap-2">
                <PlayCircle className="h-4 w-4" />
                Visualizer
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {isHome && (
              <button
                onClick={() => scrollToSection("hero")}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-primary/10 transition-colors"
              >
                <Home className="h-5 w-5 text-primary" />
                <span className="font-medium">Home</span>
              </button>
            )}

            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.to)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-primary/10"
                }`}
              >
                <span className="text-primary">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            {isHome && (
              <>
                <div className="h-px bg-border/50 my-2" />
                {["features", "how-it-works"].map((id) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-primary/10 transition-colors"
                  >
                    <span className="font-medium text-muted-foreground capitalize">
                      {id.replace(/-/g, " ")}
                    </span>
                  </button>
                ))}
              </>
            )}

            <div className="h-px bg-border/50 my-2" />

            {userId ? (
              <>
                <div className="px-4 py-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground truncate">{email}</span>
                  <Badge variant={isFaculty ? "default" : "secondary"} className="text-xs shrink-0">
                    {isFaculty ? "Faculty" : "Student"}
                  </Badge>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-primary/10 transition-colors text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors">
                <LogIn className="h-5 w-5 text-primary" />
                <span className="font-medium">Login</span>
              </Link>
            )}

            <Link to="/visualizer" onClick={() => setMobileOpen(false)} className="mt-2">
              <Button variant="glow" className="w-full gap-2">
                <PlayCircle className="h-4 w-4" />
                Launch Visualizer
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
