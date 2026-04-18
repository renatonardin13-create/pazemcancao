/**
 * Fonte única de verdade para o estado de acesso de um produto por usuário.
 *
 * REGRAS (REGRA 8 — não vazar permissão admin para visão de aluno):
 * - Esta camada NÃO consulta roles. Recebe apenas dados de acesso REAL (entitlements).
 * - Admin não libera produto automaticamente na experiência do aluno.
 *
 * Estados retornados:
 * - "owned"       → usuário possui acesso real (enrollment ativo e não expirado)
 * - "coming_soon" → produto ativo mas com launch_date futuro (e usuário NÃO possui)
 * - "locked"      → produto ativo, sem acesso, sem ser lançamento futuro
 * - "hidden"      → produto não deve aparecer (não publicado, sem entitlement)
 */
export type ProductAccessState = "owned" | "locked" | "coming_soon" | "hidden";

export interface ProductLike {
  id: string;
  status?: string | null; // 'published' | 'draft' | ...
  launch_date?: string | null;
}

export interface UserEntitlements {
  /** IDs de cursos com enrollment ativo e não expirado. */
  ownedCourseIds: ReadonlySet<string>;
}

export interface ResolveOptions {
  /** Visão "Vitrine": mostra produtos publicados mesmo sem acesso. */
  context: "vitrine" | "my_courses";
}

export function resolveProductAccessState(
  product: ProductLike,
  entitlements: UserEntitlements,
  options: ResolveOptions,
): ProductAccessState {
  const isOwned = entitlements.ownedCourseIds.has(product.id);

  // Meus Cursos: somente produtos com acesso real aparecem.
  if (options.context === "my_courses") {
    return isOwned ? "owned" : "hidden";
  }

  // Vitrine: acesso real tem prioridade absoluta (mesmo se não-lançado).
  if (isOwned) return "owned";

  // Vitrine só lista produtos publicados.
  if (product.status && product.status !== "published") return "hidden";

  const launch = product.launch_date ? new Date(product.launch_date) : null;
  if (launch && launch.getTime() > Date.now()) return "coming_soon";

  return "locked";
}

/** Helper: monta o set de entitlements a partir das linhas de enrollments. */
export function buildEntitlements(
  enrollments: Array<{ course_id: string; status: string; expires_at?: string | null }>,
): UserEntitlements {
  const ownedCourseIds = new Set<string>();
  const now = Date.now();
  for (const e of enrollments) {
    if (e.status !== "active") continue;
    if (e.expires_at && new Date(e.expires_at).getTime() < now) continue;
    ownedCourseIds.add(e.course_id);
  }
  return { ownedCourseIds };
}
