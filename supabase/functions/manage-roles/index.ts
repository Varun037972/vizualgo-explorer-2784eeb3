import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is faculty using their JWT
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) throw new Error("Unauthorized");

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check caller is faculty
    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "faculty")
      .maybeSingle();

    if (!callerRole) throw new Error("Only faculty can manage roles");

    const { action, email, user_id } = await req.json();

    if (action === "list") {
      // List all users with their roles
      const { data: users } = await adminClient.auth.admin.listUsers({ perPage: 500 });
      const { data: roles } = await adminClient.from("user_roles").select("user_id, role");

      const roleMap: Record<string, string> = {};
      roles?.forEach((r: any) => { roleMap[r.user_id] = r.role; });

      const result = users.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: roleMap[u.id] || "student",
        created_at: u.created_at,
      }));

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "promote" || action === "demote") {
      const targetId = user_id;
      if (!targetId) throw new Error("user_id is required");
      if (targetId === caller.id) throw new Error("Cannot change your own role");

      const newRole = action === "promote" ? "faculty" : "student";

      // Upsert the role
      const { error } = await adminClient
        .from("user_roles")
        .upsert({ user_id: targetId, role: newRole }, { onConflict: "user_id,role" });

      if (error) {
        // If upsert fails due to unique constraint, update instead
        await adminClient
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", targetId);
      }

      return new Response(JSON.stringify({ success: true, role: newRole }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
