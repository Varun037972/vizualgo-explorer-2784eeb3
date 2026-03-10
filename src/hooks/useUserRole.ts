import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "student" | "faculty";

export const useUserRole = () => {
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      setUserId(session.user.id);

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .limit(1)
        .single();

      setRole((data?.role as AppRole) ?? "student");
      setLoading(false);
    };

    fetchRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setRole(null);
        setUserId(null);
        setLoading(false);
      } else {
        setLoading(true);
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .limit(1)
          .single()
          .then(({ data }) => {
            setRole((data?.role as AppRole) ?? "student");
            setUserId(session.user.id);
            setLoading(false);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { role, loading, userId, isFaculty: role === "faculty", isStudent: role === "student" };
};
