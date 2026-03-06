import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, BookOpen, BarChart3, Settings, Shield, Plus, 
  Search, Download, Eye, Pencil, Trash2, GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const mockStudents = [
  { id: 1, name: "Arun Kumar", branch: "CSE", year: "3rd", quizzes: 12, avgScore: 78, lastActive: "2 hours ago" },
  { id: 2, name: "Priya Sharma", branch: "ECE", year: "2nd", quizzes: 8, avgScore: 85, lastActive: "1 day ago" },
  { id: 3, name: "Rahul Verma", branch: "CSE", year: "3rd", quizzes: 15, avgScore: 92, lastActive: "30 min ago" },
  { id: 4, name: "Sneha Patel", branch: "MECH", year: "4th", quizzes: 6, avgScore: 65, lastActive: "3 days ago" },
  { id: 5, name: "Vikram Singh", branch: "CSE", year: "2nd", quizzes: 10, avgScore: 71, lastActive: "5 hours ago" },
];

const mockContent = [
  { id: 1, title: "Bubble Sort Explained", type: "Module", status: "Published", views: 234 },
  { id: 2, title: "Binary Tree Quiz", type: "Quiz", status: "Draft", views: 0 },
  { id: 3, title: "Dijkstra's Animation", type: "Animation", status: "Published", views: 567 },
  { id: 4, title: "DP Interview Questions", type: "Interview", status: "Published", views: 189 },
];

const Faculty = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredStudents = mockStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navigation />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Faculty <span className="text-primary">Panel</span></h1>
              <p className="text-muted-foreground">Manage students, content, and monitor progress</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Students", value: "156", icon: <Users className="h-4 w-4" />, color: "text-primary" },
            { label: "Active Today", value: "43", icon: <GraduationCap className="h-4 w-4" />, color: "text-green-400" },
            { label: "Content Items", value: "24", icon: <BookOpen className="h-4 w-4" />, color: "text-amber-400" },
            { label: "Avg Quiz Score", value: "74%", icon: <BarChart3 className="h-4 w-4" />, color: "text-accent" },
          ].map((stat, i) => (
            <Card key={i} className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={stat.color}>{stat.icon}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="students">
          <TabsList className="bg-card/50 border border-border/50 mb-6">
            <TabsTrigger value="students" className="gap-2"><Users className="h-4 w-4" /> Students</TabsTrigger>
            <TabsTrigger value="content" className="gap-2"><BookOpen className="h-4 w-4" /> Content</TabsTrigger>
            <TabsTrigger value="create" className="gap-2"><Plus className="h-4 w-4" /> Create</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" /> Settings</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Student Management</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search students..." className="pl-9 w-[250px]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Quizzes</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell><Badge variant="outline">{s.branch}</Badge></TableCell>
                        <TableCell>{s.year}</TableCell>
                        <TableCell>{s.quizzes}</TableCell>
                        <TableCell>
                          <Badge className={s.avgScore >= 75 ? "bg-green-500/20 text-green-400" : s.avgScore >= 50 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}>
                            {s.avgScore}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{s.lastActive}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockContent.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell><Badge variant="outline">{c.type}</Badge></TableCell>
                        <TableCell>
                          <Badge className={c.status === "Published" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{c.views}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Tab */}
          <TabsContent value="create">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Create New Content</CardTitle>
                <CardDescription>Add modules, quizzes, or animations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="module">Learning Module</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="animation">Animation</SelectItem>
                      <SelectItem value="interview">Interview Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="Enter content title" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the content..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Branch</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        <SelectItem value="cse">CSE</SelectItem>
                        <SelectItem value="ece">ECE</SelectItem>
                        <SelectItem value="mech">Mechanical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="glow" className="w-full gap-2" onClick={() => toast({ title: "Content Created", description: "Your content has been saved as a draft." })}>
                  <Plus className="h-4 w-4" /> Create Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Faculty Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input placeholder="Prof. Name" />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input placeholder="Computer Science" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input placeholder="faculty@university.edu" type="email" />
                </div>
                <Button variant="glow">Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Faculty;
