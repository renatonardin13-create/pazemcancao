import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "renatonardin13@gmail.com";

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing server config");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Assign admin role — only callable by the hardcoded admin email.
 * Protected by auth middleware + email verification on server side.
 */
export const assignAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const admin = getAdminClient();

    // Verify caller is the admin email
    const { data: callerData, error: callerErr } =
      await admin.auth.admin.getUserById(userId);

    if (callerErr || !callerData?.user?.email) {
      return { success: false, message: "Não foi possível verificar sua identidade." };
    }

    if (callerData.user.email.toLowerCase() !== ADMIN_EMAIL) {
      return { success: false, message: "Apenas o administrador principal pode executar esta ação." };
    }

    // Assign admin role to self
    const { error } = await admin.from("user_roles").upsert(
      { user_id: userId, role: "admin" },
      { onConflict: "user_id,role" }
    );

    if (error) return { success: false, message: error.message };
    return { success: true };
  });

/**
 * Server-side admin check — more reliable than client-side RLS query.
 * Returns true if the user has admin role OR is the hardcoded admin email.
 */
export const checkIsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const admin = getAdminClient();

    // Check hardcoded email first
    const { data: userData } = await admin.auth.admin.getUserById(userId);
    if (userData?.user?.email?.toLowerCase() === ADMIN_EMAIL) {
      return { isAdmin: true };
    }

    // Check user_roles table
    const { data: roleData } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    return { isAdmin: !!roleData };
  });
