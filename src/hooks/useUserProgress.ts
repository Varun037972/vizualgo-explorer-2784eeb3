import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProgress {
  branch: string | null;
  year: string | null;
  total_study_hours: number;
  total_quizzes: number;
  total_ai_sessions: number;
  modules_completed: number;
  current_streak: number;
  last_active_date: string | null;
}

const defaultProgress: UserProgress = {
  branch: null,
  year: null,
  total_study_hours: 0,
  total_quizzes: 0,
  total_ai_sessions: 0,
  modules_completed: 0,
  current_streak: 0,
  last_active_date: null,
};

export const useUserProgress = () => {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      if (user) await loadProgress(user.id);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) await loadProgress(uid);
      else { setProgress(defaultProgress); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProgress = async (uid: string) => {
    const { data } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();
    
    if (data) {
      setProgress({
        branch: data.branch,
        year: data.year,
        total_study_hours: Number(data.total_study_hours),
        total_quizzes: data.total_quizzes,
        total_ai_sessions: data.total_ai_sessions,
        modules_completed: data.modules_completed,
        current_streak: data.current_streak,
        last_active_date: data.last_active_date,
      });
    }
    setLoading(false);
  };

  const updateProgress = useCallback(async (updates: Partial<UserProgress>) => {
    if (!userId) return;
    const newProgress = { ...progress, ...updates };
    setProgress(newProgress);

    const { data: existing } = await supabase
      .from("user_progress")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_progress")
        .update({ ...updates } as any)
        .eq("user_id", userId);
    } else {
      await supabase
        .from("user_progress")
        .insert({ user_id: userId, ...newProgress } as any);
    }
  }, [userId, progress]);

  const incrementField = useCallback(async (field: "total_quizzes" | "total_ai_sessions" | "modules_completed", amount = 1) => {
    const newVal = progress[field] + amount;
    await updateProgress({ [field]: newVal });
  }, [progress, updateProgress]);

  return { progress, loading, userId, updateProgress, incrementField };
};

export const useStudyTracker = (page: string) => {
  const startTime = useRef(Date.now());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    startTime.current = Date.now();

    const save = async () => {
      const seconds = Math.round((Date.now() - startTime.current) / 1000);
      if (seconds < 10) return; // ignore very short visits
      await supabase.from("study_sessions").insert({
        user_id: userId,
        page,
        duration_seconds: seconds,
      } as any);
    };

    window.addEventListener("beforeunload", save);
    return () => {
      save();
      window.removeEventListener("beforeunload", save);
    };
  }, [userId, page]);
};

export const saveQuizResult = async (result: {
  category: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_taken?: number;
  used_ai: boolean;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("quiz_results").insert({
    user_id: user.id,
    ...result,
  } as any);

  // Also increment quiz count
  const { data: existing } = await supabase
    .from("user_progress")
    .select("total_quizzes")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("user_progress")
      .update({ total_quizzes: (existing.total_quizzes as number) + 1 } as any)
      .eq("user_id", user.id);
  } else {
    await supabase
      .from("user_progress")
      .insert({ user_id: user.id, total_quizzes: 1 } as any);
  }
};

export const getQuizHistory = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return data || [];
};

export const getStudyHours = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from("study_sessions")
    .select("duration_seconds")
    .eq("user_id", user.id);

  if (!data) return 0;
  const totalSeconds = data.reduce((sum, s) => sum + (s.duration_seconds as number), 0);
  return Math.round(totalSeconds / 3600 * 10) / 10; // hours with 1 decimal
};
