/**
 * Guard server-side: garante que o usuário possui entitlement REAL ativo
 * para o curso solicitado. NÃO aceita role admin como bypass na área do aluno.
 *
 * Uso: dentro de loaders de rotas internas do curso, ou em server functions
 * que entreguem conteúdo protegido.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const requireProductAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { courseId: string }) => {
    if (!input?.courseId || typeof input.courseId !== "string") {
      throw new Error("courseId obrigatório");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { courseId } = data;

    const { data: rows, error } = await supabase
      .from("enrollments")
      .select("status, expires_at")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("status", "active")
      .limit(1);

    if (error) throw new Error(error.message);

    const row = rows?.[0];
    const valid =
      !!row &&
      (!row.expires_at || new Date(row.expires_at).getTime() > Date.now());

    if (!valid) {
      throw new Response("Sem acesso a este produto.", { status: 403 });
    }

    return { ok: true as const, courseId };
  });
