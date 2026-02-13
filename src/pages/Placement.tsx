import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  BrainCircuit,
  Building2,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trophy,
  Star,
  Briefcase,
  GraduationCap,
  Target,
  Users,
  MapPin,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ─── Aptitude Data ───────────────────────────────────────────────

interface AptitudeQuestion {
  question: string;
  options: string[];
  answer: number;
  category: string;
}

const aptitudeQuestions: AptitudeQuestion[] = [
  {
    question: "A train running at 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
    options: ["120 m", "150 m", "180 m", "200 m"],
    answer: 1,
    category: "Quantitative",
  },
  {
    question: "Find the missing number in the series: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "38", "44"],
    answer: 1,
    category: "Logical Reasoning",
  },
  {
    question: "If APPLE is coded as 50, then MANGO is coded as?",
    options: ["57", "52", "55", "60"],
    answer: 0,
    category: "Logical Reasoning",
  },
  {
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    answer: 1,
    category: "Technical",
  },
  {
    question: "In a class of 40 students, 12 enrolled for both English and German. 22 enrolled for German. If the students study at least one of the two languages, how many enrolled for English only?",
    options: ["18", "10", "6", "28"],
    answer: 2,
    category: "Quantitative",
  },
  {
    question: "Which data structure uses LIFO order?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    answer: 1,
    category: "Technical",
  },
  {
    question: "Choose the correct synonym of 'Eloquent':",
    options: ["Silent", "Articulate", "Rude", "Confused"],
    answer: 1,
    category: "Verbal",
  },
  {
    question: "A is the father of B. B is the sister of C. D is the mother of C. How is A related to D?",
    options: ["Brother", "Father", "Husband", "Son"],
    answer: 2,
    category: "Logical Reasoning",
  },
  {
    question: "What does SQL stand for?",
    options: ["Simple Query Language", "Structured Query Language", "Standard Query Logic", "System Query Language"],
    answer: 1,
    category: "Technical",
  },
  {
    question: "If the cost price is ₹500 and selling price is ₹600, what is the profit percentage?",
    options: ["15%", "20%", "25%", "10%"],
    answer: 1,
    category: "Quantitative",
  },
];

// ─── Company Data ────────────────────────────────────────────────

interface Company {
  name: string;
  logo: string;
  roles: string[];
  package: string;
  location: string;
  type: string;
  skills: string[];
}

const companies: Company[] = [
  { name: "Google", logo: "🟢", roles: ["SDE", "SDE-II", "Data Engineer"], package: "₹25-45 LPA", location: "Bangalore, Hyderabad", type: "Product", skills: ["DSA", "System Design", "Python/C++"] },
  { name: "Microsoft", logo: "🟦", roles: ["SDE", "PM", "Data Scientist"], package: "₹20-40 LPA", location: "Hyderabad, Noida", type: "Product", skills: ["DSA", "OS", "DBMS"] },
  { name: "Amazon", logo: "🟠", roles: ["SDE-I", "SDE-II", "Cloud Engineer"], package: "₹18-35 LPA", location: "Bangalore, Chennai", type: "Product", skills: ["DSA", "Leadership Principles", "System Design"] },
  { name: "TCS", logo: "🔵", roles: ["System Engineer", "Assistant Consultant"], package: "₹3.5-7 LPA", location: "Pan India", type: "Service", skills: ["Aptitude", "Coding", "Communication"] },
  { name: "Infosys", logo: "🟣", roles: ["System Engineer", "Power Programmer"], package: "₹3.6-9 LPA", location: "Pan India", type: "Service", skills: ["Aptitude", "Java/Python", "SQL"] },
  { name: "Wipro", logo: "🌐", roles: ["Project Engineer", "Elite NLTH"], package: "₹3.5-6.5 LPA", location: "Pan India", type: "Service", skills: ["Aptitude", "Programming", "English"] },
  { name: "Flipkart", logo: "🟡", roles: ["SDE", "Business Analyst"], package: "₹20-35 LPA", location: "Bangalore", type: "Product", skills: ["DSA", "Machine Learning", "System Design"] },
  { name: "Zoho", logo: "🔴", roles: ["Member Technical Staff"], package: "₹6-14 LPA", location: "Chennai", type: "Product", skills: ["C Programming", "Problem Solving", "OOP"] },
];

// ─── Interview Questions ─────────────────────────────────────────

interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: string;
  sampleAnswer: string;
}

const interviewQuestions: InterviewQuestion[] = [
  { question: "Tell me about yourself.", category: "HR", difficulty: "Easy", sampleAnswer: "Start with your name, branch, year, key skills, a project highlight, and what you're passionate about in tech." },
  { question: "What is polymorphism in OOP?", category: "Technical", difficulty: "Medium", sampleAnswer: "Polymorphism means 'many forms'. In OOP, it allows objects of different classes to be treated as the same interface. Compile-time (overloading) and runtime (overriding) are the two types." },
  { question: "Explain the difference between Stack and Queue.", category: "Technical", difficulty: "Easy", sampleAnswer: "Stack follows LIFO (Last In First Out) while Queue follows FIFO (First In First Out). Stack uses push/pop; Queue uses enqueue/dequeue." },
  { question: "What are your strengths and weaknesses?", category: "HR", difficulty: "Easy", sampleAnswer: "Strength: I'm a fast learner and consistent with practice. Weakness: I sometimes over-prepare, but I'm learning to manage time better." },
  { question: "Explain the difference between TCP and UDP.", category: "Technical", difficulty: "Medium", sampleAnswer: "TCP is connection-oriented, reliable, and ensures packet ordering. UDP is connectionless, faster, used in streaming/gaming where some data loss is acceptable." },
  { question: "Where do you see yourself in 5 years?", category: "HR", difficulty: "Easy", sampleAnswer: "I see myself as a senior engineer contributing to impactful products, mentoring juniors, and possibly leading a small team." },
  { question: "Write a function to reverse a linked list.", category: "DSA", difficulty: "Medium", sampleAnswer: "Use three pointers: prev=null, current=head, next=null. Iterate: next=current.next, current.next=prev, prev=current, current=next. Return prev." },
  { question: "What is normalization in DBMS?", category: "Technical", difficulty: "Medium", sampleAnswer: "Normalization organizes data to reduce redundancy. 1NF removes repeating groups, 2NF removes partial dependencies, 3NF removes transitive dependencies." },
];

// ─── Aptitude Mock Test Component ────────────────────────────────

const AptitudeMockTest = () => {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(aptitudeQuestions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 min

  // Timer
  useState(() => {
    if (!started || showResult) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  const score = answers.reduce((acc, ans, i) => (ans === aptitudeQuestions[i].answer ? acc + 1 : acc), 0);
  const percentage = Math.round((score / aptitudeQuestions.length) * 100);

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = selected;
    setAnswers(newAnswers);
    setSelected(null);
    if (currentQ < aptitudeQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
    }
  };

  if (!started) {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <BrainCircuit className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Aptitude Mock Test</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {aptitudeQuestions.length} questions • 10 minutes • Covers Quantitative, Logical Reasoning, Verbal & Technical
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Quantitative", "Logical Reasoning", "Technical", "Verbal"].map((cat) => (
            <Badge key={cat} variant="outline" className="bg-primary/5 border-primary/20">{cat}</Badge>
          ))}
        </div>
        <Button size="lg" onClick={() => setStarted(true)} className="gap-2">
          <Target className="h-5 w-5" /> Start Test
        </Button>
      </div>
    );
  }

  if (showResult) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 py-8">
        <div className="text-center space-y-4">
          <Trophy className={`h-16 w-16 mx-auto ${percentage >= 70 ? "text-accent" : percentage >= 40 ? "text-primary" : "text-destructive"}`} />
          <h2 className="text-3xl font-bold">{percentage}%</h2>
          <p className="text-muted-foreground">You scored {score} out of {aptitudeQuestions.length}</p>
          <Progress value={percentage} className="w-64 mx-auto h-3" />
        </div>
        <div className="grid gap-3 max-w-2xl mx-auto">
          {aptitudeQuestions.map((q, i) => (
            <div key={i} className={`p-4 rounded-lg border ${answers[i] === q.answer ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"}`}>
              <div className="flex items-start gap-3">
                {answers[i] === q.answer ? <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />}
                <div>
                  <p className="text-sm font-medium">{q.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your answer: {answers[i] !== null ? q.options[answers[i]] : "Skipped"} • Correct: {q.options[q.answer]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button onClick={() => { setStarted(false); setCurrentQ(0); setSelected(null); setAnswers(Array(aptitudeQuestions.length).fill(null)); setShowResult(false); setTimeLeft(600); }}>
            Retry Test
          </Button>
        </div>
      </motion.div>
    );
  }

  const q = aptitudeQuestions[currentQ];
  return (
    <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-primary/5">{q.category}</Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </div>
      <Progress value={((currentQ + 1) / aptitudeQuestions.length) * 100} className="h-2" />
      <p className="text-xs text-muted-foreground">Question {currentQ + 1} of {aptitudeQuestions.length}</p>
      <h3 className="text-lg font-semibold">{q.question}</h3>
      <div className="grid gap-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`text-left p-4 rounded-lg border transition-all ${selected === i ? "border-primary bg-primary/10 shadow-md" : "border-border/50 hover:border-primary/30 hover:bg-card/80"}`}
          >
            <span className="text-sm">{opt}</span>
          </button>
        ))}
      </div>
      <Button onClick={handleNext} disabled={selected === null} className="w-full gap-2">
        {currentQ < aptitudeQuestions.length - 1 ? "Next Question" : "Submit Test"} <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};

// ─── Company Cards Component ─────────────────────────────────────

const CompanyCards = () => {
  const [filter, setFilter] = useState<string>("All");

  const filtered = filter === "All" ? companies : companies.filter((c) => c.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {["All", "Product", "Service"].map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((company) => (
          <motion.div key={company.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{company.logo}</span>
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">{company.type}-Based</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{company.roles.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Star className="h-4 w-4" />
                  <span>{company.package}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{company.location}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {company.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── Resume Builder Component ────────────────────────────────────

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  branch: string;
  college: string;
  cgpa: string;
  skills: string;
  projects: { title: string; description: string }[];
  summary: string;
}

const ResumeBuilder = () => {
  const [resume, setResume] = useState<ResumeData>({
    name: "", email: "", phone: "", branch: "", college: "", cgpa: "", skills: "", projects: [{ title: "", description: "" }], summary: "",
  });
  const [showPreview, setShowPreview] = useState(false);

  const updateField = (field: keyof ResumeData, value: string) => {
    setResume((prev) => ({ ...prev, [field]: value }));
  };

  const addProject = () => {
    setResume((prev) => ({ ...prev, projects: [...prev.projects, { title: "", description: "" }] }));
  };

  const removeProject = (index: number) => {
    setResume((prev) => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
  };

  const updateProject = (index: number, field: "title" | "description", value: string) => {
    setResume((prev) => {
      const projects = [...prev.projects];
      projects[index] = { ...projects[index], [field]: value };
      return { ...prev, projects };
    });
  };

  const handleGenerate = () => {
    if (!resume.name || !resume.email || !resume.branch) {
      toast.error("Please fill in at least Name, Email, and Branch.");
      return;
    }
    setShowPreview(true);
    toast.success("Resume preview generated!");
  };

  return (
    <div className="space-y-6">
      {!showPreview ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Personal Details</h3>
            <Input placeholder="Full Name" value={resume.name} onChange={(e) => updateField("name", e.target.value)} />
            <Input placeholder="Email" type="email" value={resume.email} onChange={(e) => updateField("email", e.target.value)} />
            <Input placeholder="Phone" value={resume.phone} onChange={(e) => updateField("phone", e.target.value)} />
            <Input placeholder="Branch (e.g. CSE)" value={resume.branch} onChange={(e) => updateField("branch", e.target.value)} />
            <Input placeholder="College Name" value={resume.college} onChange={(e) => updateField("college", e.target.value)} />
            <Input placeholder="CGPA" value={resume.cgpa} onChange={(e) => updateField("cgpa", e.target.value)} />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Skills & Projects</h3>
            <Input placeholder="Skills (comma separated)" value={resume.skills} onChange={(e) => updateField("skills", e.target.value)} />
            <Textarea placeholder="Professional summary (2-3 sentences)" value={resume.summary} onChange={(e) => updateField("summary", e.target.value)} rows={3} />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Projects</span>
                <Button variant="outline" size="sm" onClick={addProject} className="gap-1"><Plus className="h-3 w-3" /> Add</Button>
              </div>
              {resume.projects.map((p, i) => (
                <div key={i} className="space-y-2 p-3 border border-border/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Project {i + 1}</span>
                    {resume.projects.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeProject(i)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    )}
                  </div>
                  <Input placeholder="Project Title" value={p.title} onChange={(e) => updateProject(i, "title", e.target.value)} />
                  <Textarea placeholder="Short description" value={p.description} onChange={(e) => updateProject(i, "description", e.target.value)} rows={2} />
                </div>
              ))}
            </div>
            <Button onClick={handleGenerate} className="w-full gap-2"><FileText className="h-4 w-4" /> Generate Resume Preview</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>← Back to Edit</Button>
          <Card className="bg-background border-2 border-primary/20 max-w-2xl mx-auto">
            <CardContent className="p-8 space-y-6">
              <div className="text-center border-b border-border pb-4">
                <h2 className="text-2xl font-bold">{resume.name}</h2>
                <p className="text-sm text-muted-foreground">{resume.email} • {resume.phone}</p>
                <p className="text-sm text-muted-foreground">{resume.branch} — {resume.college}</p>
              </div>
              {resume.summary && (
                <div><h4 className="text-sm font-bold uppercase text-primary mb-1">Summary</h4><p className="text-sm">{resume.summary}</p></div>
              )}
              {resume.cgpa && (
                <div><h4 className="text-sm font-bold uppercase text-primary mb-1">Education</h4><p className="text-sm">{resume.branch} — {resume.college} • CGPA: {resume.cgpa}</p></div>
              )}
              {resume.skills && (
                <div>
                  <h4 className="text-sm font-bold uppercase text-primary mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">{resume.skills.split(",").map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s.trim()}</Badge>)}</div>
                </div>
              )}
              {resume.projects.some((p) => p.title) && (
                <div>
                  <h4 className="text-sm font-bold uppercase text-primary mb-2">Projects</h4>
                  {resume.projects.filter((p) => p.title).map((p, i) => (
                    <div key={i} className="mb-2"><p className="text-sm font-semibold">{p.title}</p><p className="text-xs text-muted-foreground">{p.description}</p></div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// ─── Interview Practice Component ────────────────────────────────

const InterviewPractice = () => {
  const [filter, setFilter] = useState("All");
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const filtered = filter === "All" ? interviewQuestions : interviewQuestions.filter((q) => q.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {["All", "HR", "Technical", "DSA"].map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>
      <div className="grid gap-3">
        <AnimatePresence>
          {filtered.map((q, i) => (
            <motion.div key={q.question} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card
                className="bg-card/50 border-border/50 backdrop-blur-sm cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => setExpandedQ(expandedQ === i ? null : i)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{q.category}</Badge>
                        <Badge variant={q.difficulty === "Easy" ? "secondary" : "default"} className="text-xs">{q.difficulty}</Badge>
                      </div>
                      <p className="font-medium text-sm">{q.question}</p>
                    </div>
                    <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                  <AnimatePresence>
                    {expandedQ === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs font-semibold text-primary mb-1">Sample Answer:</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{q.sampleAnswer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Main Placement Page ─────────────────────────────────────────

const Placement = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navigation />
      <div className="container mx-auto px-4 py-8 animate-fade-in-up relative">
        <div className="mb-8 text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Placement Portal</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Prepare for aptitude tests, explore top companies, build your resume, and practice interview questions — all in one place.
          </p>
        </div>

        <Tabs defaultValue="aptitude" className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 gap-1 mb-6">
            <TabsTrigger value="aptitude" className="gap-2 text-xs md:text-sm">
              <BrainCircuit className="h-4 w-4" /> Aptitude
            </TabsTrigger>
            <TabsTrigger value="companies" className="gap-2 text-xs md:text-sm">
              <Building2 className="h-4 w-4" /> Companies
            </TabsTrigger>
            <TabsTrigger value="resume" className="gap-2 text-xs md:text-sm">
              <FileText className="h-4 w-4" /> Resume
            </TabsTrigger>
            <TabsTrigger value="interview" className="gap-2 text-xs md:text-sm">
              <MessageSquare className="h-4 w-4" /> Interview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aptitude">
            <AptitudeMockTest />
          </TabsContent>
          <TabsContent value="companies">
            <CompanyCards />
          </TabsContent>
          <TabsContent value="resume">
            <ResumeBuilder />
          </TabsContent>
          <TabsContent value="interview">
            <InterviewPractice />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Placement;
