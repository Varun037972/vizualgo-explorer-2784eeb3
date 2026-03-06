import { Navigation } from "@/components/Navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, TrendingUp, Clock, Trophy, Brain, Target, 
  BookOpen, Zap, Award, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const weeklyData = [
  { day: "Mon", hours: 2.5, quizzes: 3 },
  { day: "Tue", hours: 1.8, quizzes: 2 },
  { day: "Wed", hours: 3.2, quizzes: 5 },
  { day: "Thu", hours: 2.0, quizzes: 1 },
  { day: "Fri", hours: 4.1, quizzes: 4 },
  { day: "Sat", hours: 1.5, quizzes: 2 },
  { day: "Sun", hours: 3.0, quizzes: 3 },
];

const progressData = [
  { week: "W1", score: 45 },
  { week: "W2", score: 52 },
  { week: "W3", score: 58 },
  { week: "W4", score: 65 },
  { week: "W5", score: 72 },
  { week: "W6", score: 78 },
];

const topicPie = [
  { name: "Sorting", value: 35, color: "hsl(193, 100%, 50%)" },
  { name: "Trees", value: 25, color: "hsl(160, 100%, 50%)" },
  { name: "Graphs", value: 20, color: "hsl(270, 70%, 65%)" },
  { name: "DP", value: 10, color: "hsl(45, 100%, 60%)" },
  { name: "Other", value: 10, color: "hsl(0, 0%, 50%)" },
];

const radarData = [
  { subject: "Sorting", A: 80 },
  { subject: "Trees", A: 65 },
  { subject: "Graphs", A: 55 },
  { subject: "DP", A: 40 },
  { subject: "Strings", A: 70 },
  { subject: "Arrays", A: 85 },
];

const achievements = [
  { title: "First Quiz", description: "Complete your first quiz", unlocked: true },
  { title: "Speed Demon", description: "Score 100% under 2 min", unlocked: false },
  { title: "7-Day Streak", description: "Study 7 days in a row", unlocked: false },
  { title: "AI Explorer", description: "Complete 10 AI tutor sessions", unlocked: true },
  { title: "Master Sorter", description: "Complete all sorting modules", unlocked: false },
  { title: "Code Warrior", description: "Submit 50 code solutions", unlocked: false },
];

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navigation />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Learning <span className="text-primary">Analytics</span>
          </h1>
          <p className="text-muted-foreground text-lg">Track your progress and identify areas for improvement</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Study Hours", value: "18.1h", icon: <Clock className="h-4 w-4" />, color: "text-primary" },
            { label: "Quizzes Completed", value: "20", icon: <Trophy className="h-4 w-4" />, color: "text-amber-400" },
            { label: "Avg Score", value: "72%", icon: <Target className="h-4 w-4" />, color: "text-green-400" },
            { label: "Current Streak", value: "5 days", icon: <Zap className="h-4 w-4" />, color: "text-accent" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={stat.color}>{stat.icon}</span>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Study Hours */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Weekly Study Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 20%)" />
                    <XAxis dataKey="day" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(230, 30%, 10%)", border: "1px solid hsl(230, 20%, 20%)", borderRadius: 8 }} />
                    <Bar dataKey="hours" fill="hsl(193, 100%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress Over Time */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" /> Score Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 20%)" />
                    <XAxis dataKey="week" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(230, 30%, 10%)", border: "1px solid hsl(230, 20%, 20%)", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="score" stroke="hsl(160, 100%, 50%)" strokeWidth={2} dot={{ fill: "hsl(160, 100%, 50%)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Topic Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-accent" /> Topic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={topicPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {topicPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(230, 30%, 10%)", border: "1px solid hsl(230, 20%, 20%)", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skill Radar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" /> Skill Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(230, 20%, 20%)" />
                    <PolarAngleAxis dataKey="subject" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <PolarRadiusAxis stroke="hsl(215, 20%, 65%)" fontSize={10} />
                    <Radar dataKey="A" stroke="hsl(193, 100%, 50%)" fill="hsl(193, 100%, 50%)" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" /> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {achievements.map((a, i) => (
                  <div key={i} className={`text-center p-4 rounded-lg border ${a.unlocked ? "border-amber-500/30 bg-amber-500/5" : "border-border/30 bg-muted/10 opacity-50"}`}>
                    <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${a.unlocked ? "bg-amber-500/20" : "bg-muted/30"}`}>
                      {a.unlocked ? <CheckCircle2 className="h-5 w-5 text-amber-400" /> : <Trophy className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <p className="text-xs font-semibold">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{a.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
