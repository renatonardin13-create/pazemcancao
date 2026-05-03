import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_EMAIL = "renatonardin13@gmail.com";

async function assertCallerIsAdmin(userId: string) {
  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
  const email = userData?.user?.email?.toLowerCase();
  if (email === ADMIN_EMAIL) return { email, ok: true as const };

  const { data: roleData } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleData) throw new Error("Apenas administradores podem impersonar.");
  return { email: email ?? "", ok: true as const };
}

/**
 * Gera magic link para o aluno alvo e registra log de auditoria.
 * O admin será deslogado no client e redirecionado para o magic link,
 * passando a navegar como o aluno.
 */
export const startImpersonation = createServerFn({ method: "POST" })
  .inputValidator((input: { targetEmail: string }) => {
    const email = String(input?.targetEmail ?? "").trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new Error("Email do aluno inválido.");
    }
    if (email === ADMIN_EMAIL) {
      throw new Error("Não é possível impersonar a conta de administrador.");
    }
    return { targetEmail: email };
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const caller = await assertCallerIsAdmin(userId);

    // Resolve target user (precisa existir em auth.users)
    const { data: targetUser, error: targetErr } = await supabaseAdmin
      .auth.admin.listUsers({ page: 1, perPage: 200 });
    if (targetErr) throw new Error("Falha ao localizar o aluno alvo.");

    const target = targetUser?.users.find(
      (u) => u.email?.toLowerCase() === data.targetEmail
    );

    if (!target) {
      throw new Error(
        "Aluno ainda não tem conta criada. Peça para ele fazer o primeiro login antes de impersonar."
      );
    }

    // Gera magic link de login
    const { data: linkData, error: linkErr } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: data.targetEmail,
      });

    if (linkErr || !linkData?.properties?.action_link) {
      throw new Error(linkErr?.message || "Não foi possível gerar o acesso.");
    }

    // Audit log
    const ip = (() => {
      try {
        return getRequestIP({ xForwardedFor: true }) ?? null;
      } catch {
        return null;
      }
    })();
    const userAgent = (() => {
      try {
        return getRequestHeader("user-agent") ?? null;
      } catch {
        return null;
      }
    })();

    const { data: logRow, error: logErr } = await supabaseAdmin
      .from("impersonation_logs")
      .insert({
        admin_user_id: userId,
        admin_email: caller.email,
        target_email: data.targetEmail,
        target_user_id: target.id,
        ip_address: ip,
        user_agent: userAgent,
      })
      .select("id")
      .single();

    if (logErr) {
      console.error("[impersonation] failed to write audit log", logErr);
    }

    return {
      success: true as const,
      magicLink: linkData.properties.action_link,
      logId: logRow?.id ?? null,
      adminEmail: caller.email,
      targetEmail: data.targetEmail,
    };
  });

/**
 * Marca encerramento da impersonação no log.
 */
export const endImpersonation = createServerFn({ method: "POST" })
  .inputValidator((input: { logId: string }) => {
    const logId = String(input?.logId ?? "").trim();
    if (!logId) throw new Error("logId obrigatório.");
    return { logId };
  })
  .handler(async ({ data }) => {
    // Não exige auth — pode ser chamado já como o aluno impersonado encerrando.
    const { error } = await supabaseAdmin
      .from("impersonation_logs")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", data.logId)
      .is("ended_at", null);

    if (error) {
      console.error("[impersonation] failed to close log", error);
    }
    return { success: true as const };
  });

/**
 * Lista os logs mais recentes para o painel admin.
 */
export const listImpersonationLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCallerIsAdmin(context.userId);

    const { data, error } = await supabaseAdmin
      .from("impersonation_logs")
      .select("id, admin_email, target_email, started_at, ended_at, ip_address")
      .order("started_at", { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return { logs: data ?? [] };
  });
