import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Send, BookOpen, HelpCircle, Code2, FileText, 
  MessageSquare, Loader2, Sparkles, Bot, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useStudyTracker } from "@/hooks/useUserProgress";

type Mode = "explain" | "mcq" | "interview" | "code" | "notes";
type Message = { role: "user" | "assistant"; content: string; mode?: Mode };

const modes: { id: Mode; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "explain", label: "Explain", icon: <BookOpen className="h-4 w-4" />, description: "Get clear explanations on any topic" },
  { id: "mcq", label: "MCQ", icon: <HelpCircle className="h-4 w-4" />, description: "Generate practice MCQ questions" },
  { id: "interview", label: "Interview", icon: <MessageSquare className="h-4 w-4" />, description: "Practice interview Q&A" },
  { id: "code", label: "Code Review", icon: <Code2 className="h-4 w-4" />, description: "Get code feedback & fixes" },
  { id: "notes", label: "Notes", icon: <FileText className="h-4 w-4" />, description: "Generate study notes" },
];

const modeSystemPrompts: Record<Mode, string> = {
  explain: "You are a friendly engineering tutor. Explain concepts clearly with examples, analogies, and step-by-step breakdowns. Use markdown formatting.",
  mcq: "You are an MCQ generator for engineering students. When asked about a topic, generate 5 MCQs with 4 options each, mark the correct answer, and provide brief explanations. Use markdown formatting.",
  interview: "You are an interview preparation coach. When given a topic, provide common interview questions and detailed model answers. Include both technical and HR questions. Use markdown formatting.",
  code: "You are a code review expert. Analyze the given code for bugs, optimization opportunities, and best practices. Provide corrected code with explanations. Use markdown formatting with code blocks.",
  notes: "You are a study notes generator. Create concise, well-structured revision notes with key points, formulas, definitions, and diagrams described in text. Use markdown formatting with headers and bullet points.",
};

const AITutor = () => {
  const [mode, setMode] = useState<Mode>("explain");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useStudyTracker("ai-tutor");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input.trim(), mode };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const systemPrompt = modeSystemPrompts[mode];
      const conversationHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: conversationHistory, systemPrompt, mode }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) throw new Error("Rate limited. Please try again shortly.");
        if (response.status === 402) throw new Error("AI credits exhausted. Please add credits.");
        throw new Error("Failed to get response");
      }

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      setMessages(prev => [...prev, { role: "assistant", content: "", mode }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent, mode };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again.", mode }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <AnimatedBackground />
      <Navigation />

      <div className="container mx-auto px-4 py-6 relative z-10 flex-1 flex flex-col max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Tutor</h1>
              <p className="text-sm text-muted-foreground">Your personal learning assistant</p>
            </div>
          </div>

          {/* Mode Selector */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList className="bg-card/50 border border-border/50 w-full justify-start overflow-x-auto">
              {modes.map(m => (
                <TabsTrigger key={m.id} value={m.id} className="gap-2 data-[state=active]:bg-primary/20 whitespace-nowrap">
                  {m.icon}
                  <span className="hidden sm:inline">{m.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <p className="text-xs text-muted-foreground mt-2">
            {modes.find(m => m.id === mode)?.description}
          </p>
        </motion.div>

        {/* Chat Area */}
        <Card className="flex-1 bg-card/30 border-border/50 backdrop-blur-sm flex flex-col min-h-0">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  Ask me anything in <Badge variant="outline" className="mx-1">{modes.find(m => m.id === mode)?.label}</Badge> mode.
                  Try: "Explain binary search trees" or "Generate MCQs on sorting algorithms"
                </p>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-foreground"
                  }`}>
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {msg.content || (isLoading && i === messages.length - 1 ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
                        </span>
                      ) : null)}
                    </div>
                    {msg.mode && msg.role === "assistant" && (
                      <Badge variant="outline" className="mt-2 text-[10px]">{msg.mode}</Badge>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-4 w-4 text-accent" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask in ${modes.find(m => m.id === mode)?.label} mode...`}
                className="min-h-[48px] max-h-[120px] resize-none bg-muted/30"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="h-auto px-4"
                variant="glow"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AITutor;
