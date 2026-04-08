import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const assignAdminRole = createServerFn({ method: "POST" })
  .handler(async () => {
    // This is a utility — assign admin to a specific email
    const adminEmail = "renatonardin13@gmail.com";

    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const adminUser = users?.users?.find((u) => u.email === adminEmail);

    if (!adminUser) {
      return { success: false, message: "Usuário admin não encontrado. Faça login primeiro." };
    }

    const { error } = await supabaseAdmin.from("user_roles").upsert(
      { user_id: adminUser.id, role: "admin" },
      { onConflict: "user_id,role" }
    );

    if (error) return { success: false, message: error.message };
    return { success: true };
  });
