import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, TrendingUp, Clock, Trophy, Brain, Target, 
  BookOpen, Zap, Award, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { useUserProgress, getQuizHistory, getStudyHours, useStudyTracker } from "@/hooks/useUserProgress";

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
  { title: "First Quiz", description: "Complete your first quiz", key: "first_quiz" },
  { title: "Speed Demon", description: "Score 100% under 2 min", key: "speed_demon" },
  { title: "7-Day Streak", description: "Study 7 days in a row", key: "streak_7" },
  { title: "AI Explorer", description: "Complete 10 AI tutor sessions", key: "ai_explorer" },
  { title: "Master Sorter", description: "Complete all sorting modules", key: "master_sorter" },
  { title: "Quiz Master", description: "Complete 20 quizzes", key: "quiz_master" },
];

const Analytics = () => {
  const { progress } = useUserProgress();
  const [studyHours, setStudyHours] = useState(0);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);

  useStudyTracker("analytics");

  useEffect(() => {
    getStudyHours().then(setStudyHours);
    getQuizHistory().then(setQuizHistory);
  }, []);

  const avgScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((sum, q) => sum + q.percentage, 0) / quizHistory.length)
    : 0;

  // Build weekly data from quiz history
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = days.map(day => {
    const dayQuizzes = quizHistory.filter(q => {
      const d = new Date(q.created_at);
      return days[d.getDay()] === day;
    });
    return { day, quizzes: dayQuizzes.length, hours: +(dayQuizzes.length * 0.3).toFixed(1) };
  });

  // Build progress data from last quizzes
  const progressData = quizHistory.slice(0, 10).reverse().map((q, i) => ({
    quiz: `Q${i + 1}`,
    score: q.percentage,
  }));

  // Compute achievements
  const unlockedAchievements = new Set<string>();
  if (quizHistory.length >= 1) unlockedAchievements.add("first_quiz");
  if (quizHistory.some(q => q.percentage === 100 && q.time_taken && q.time_taken < 120)) unlockedAchievements.add("speed_demon");
  if (progress.current_streak >= 7) unlockedAchievements.add("streak_7");
  if (progress.total_ai_sessions >= 10) unlockedAchievements.add("ai_explorer");
  if (quizHistory.length >= 20) unlockedAchievements.add("quiz_master");

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
            { label: "Total Study Hours", value: `${studyHours}h`, icon: <Clock className="h-4 w-4" />, color: "text-primary" },
            { label: "Quizzes Completed", value: String(progress.total_quizzes), icon: <Trophy className="h-4 w-4" />, color: "text-amber-400" },
            { label: "Avg Score", value: `${avgScore}%`, icon: <Target className="h-4 w-4" />, color: "text-green-400" },
            { label: "Current Streak", value: `${progress.current_streak} days`, icon: <Zap className="h-4 w-4" />, color: "text-accent" },
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Weekly Quiz Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 20%)" />
                    <XAxis dataKey="day" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(230, 30%, 10%)", border: "1px solid hsl(230, 20%, 20%)", borderRadius: 8 }} />
                    <Bar dataKey="quizzes" fill="hsl(193, 100%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" /> Score Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {progressData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 20%)" />
                      <XAxis dataKey="quiz" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                      <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                      <Tooltip contentStyle={{ background: "hsl(230, 30%, 10%)", border: "1px solid hsl(230, 20%, 20%)", borderRadius: 8 }} />
                      <Line type="monotone" dataKey="score" stroke="hsl(160, 100%, 50%)" strokeWidth={2} dot={{ fill: "hsl(160, 100%, 50%)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">Complete quizzes to see your progress</div>
                )}
              </CardContent>
            </Card>
          </motion.div>

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
                {achievements.map((a, i) => {
                  const unlocked = unlockedAchievements.has(a.key);
                  return (
                    <div key={i} className={`text-center p-4 rounded-lg border ${unlocked ? "border-amber-500/30 bg-amber-500/5" : "border-border/30 bg-muted/10 opacity-50"}`}>
                      <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${unlocked ? "bg-amber-500/20" : "bg-muted/30"}`}>
                        {unlocked ? <CheckCircle2 className="h-5 w-5 text-amber-400" /> : <Trophy className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <p className="text-xs font-semibold">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{a.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
