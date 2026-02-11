import { Navigation } from "@/components/Navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Map, Hospital, Package, Users, ArrowRight, Globe } from "lucide-react";
import { motion } from "framer-motion";

const simulations = [
  {
    algorithm: "Dijkstra's Algorithm",
    realWorld: "GPS Navigation (Google Maps)",
    icon: <Map className="h-8 w-8" />,
    description: "Find the shortest route between two locations on a map. Just like Google Maps calculates the fastest path considering road distances and traffic.",
    how: "Nodes represent intersections, edges represent roads with weights as distances. Dijkstra finds the shortest total distance from your location to the destination.",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    link: "/visualizer",
  },
  {
    algorithm: "Priority Queue / Scheduling",
    realWorld: "Hospital Emergency Queue",
    icon: <Hospital className="h-8 w-8" />,
    description: "Triage patients in an emergency room based on severity. Critical patients are treated first regardless of arrival time.",
    how: "A priority queue (min-heap) orders patients by urgency level. Each new patient is inserted with a priority score, and the most critical is always dequeued first.",
    color: "from-red-500/20 to-pink-500/20",
    borderColor: "border-red-500/30",
    link: "/visualizer",
  },
  {
    algorithm: "Sorting Algorithms",
    realWorld: "Warehouse Inventory System",
    icon: <Package className="h-8 w-8" />,
    description: "Sort warehouse items by weight, size, or priority for efficient packing and shipping. Different sorts excel at different data patterns.",
    how: "Quick Sort for large inventories (fast average case), Merge Sort when stability matters (preserving original order of equal items), Insertion Sort for nearly-sorted restocks.",
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30",
    link: "/visualizer",
  },
  {
    algorithm: "BFS / DFS",
    realWorld: "Social Network Analysis",
    icon: <Users className="h-8 w-8" />,
    description: "Find connections between people, suggest friends, or detect communities in a social network like Facebook or LinkedIn.",
    how: "BFS finds shortest connection paths ('degrees of separation'). DFS detects cycles (mutual friend groups). Both traverse the social graph to discover relationships.",
    color: "from-purple-500/20 to-violet-500/20",
    borderColor: "border-purple-500/30",
    link: "/visualizer",
  },
  {
    algorithm: "A* Search",
    realWorld: "Robot Path Planning",
    icon: <Globe className="h-8 w-8" />,
    description: "Navigate a robot through obstacles to reach a target. Used in autonomous vehicles, drones, and game AI pathfinding.",
    how: "A* combines Dijkstra's actual cost with a heuristic estimate of remaining distance. This 'informed search' finds optimal paths faster than blind search algorithms.",
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30",
    link: "/visualizer",
  },
  {
    algorithm: "Kruskal's / Prim's MST",
    realWorld: "Network Cable Layout",
    icon: <Globe className="h-8 w-8" />,
    description: "Connect all offices in a building with the minimum total cable length. Used by ISPs and electrical grid planners.",
    how: "Minimum Spanning Tree algorithms find the cheapest way to connect all nodes. Kruskal's sorts edges by weight; Prim's grows from a starting node.",
    color: "from-teal-500/20 to-sky-500/20",
    borderColor: "border-teal-500/30",
    link: "/visualizer",
  },
];

const Simulations = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navigation />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Real-World <span className="text-primary">Simulations</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            See how algorithms power everyday technology — from GPS navigation to social networks.
          </p>
        </motion.div>

        {/* Simulation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulations.map((sim, index) => (
            <motion.div
              key={sim.algorithm}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className={`bg-gradient-to-br ${sim.color} border ${sim.borderColor} hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-xl bg-background/30 flex items-center justify-center text-primary mb-3">
                      {sim.icon}
                    </div>
                    <Badge variant="outline" className="text-xs">{sim.algorithm}</Badge>
                  </div>
                  <CardTitle className="text-xl">{sim.realWorld}</CardTitle>
                  <CardDescription>{sim.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="bg-background/20 rounded-lg p-4 mb-4">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">How it works: </span>
                      {sim.how}
                    </p>
                  </div>
                  <Link to={sim.link}>
                    <Button variant="outline" className="w-full gap-2">
                      Try in Visualizer <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Simulations;
