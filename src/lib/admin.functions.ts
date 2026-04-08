import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/integrations/supabase/client.server";

export const checkIsAdmin = createServerFn({ method: "GET" })
  .handler(async () => {
    const supabase = getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { isAdmin: false };

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    return { isAdmin: !!data };
  });
