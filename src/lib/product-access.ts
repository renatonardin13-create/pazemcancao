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
  status?: string | null; // 'published' | 'draft' | 'coming_soon' | ...
  launch_date?: string | null;
  is_active?: boolean | null;
  show_in_store?: boolean | null;
}

export interface UserEntitlements {
  /** IDs de cursos com enrollment ativo e não expirado. */
  ownedCourseIds: ReadonlySet<string>;
}

export interface ResolveOptions {
  /** Visão "Vitrine": mostra produtos publicados mesmo sem acesso.
   *  Visão "my_courses": somente owned. */
  context: "vitrine" | "my_courses";
  /** Preview administrativo manual e EXPLÍCITO. Nunca true por padrão. */
  previewMode?: boolean;
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

  // Vitrine — acesso real tem prioridade absoluta.
  if (isOwned) return "owned";

  // Preview administrativo manual: simula owned sem alterar dados reais.
  if (options.previewMode) return "owned";

  // Produto não ativo / não visível na loja → hidden.
  if (product.is_active === false) return "hidden";
  if (product.show_in_store === false) return "hidden";

  // Status explícito de coming_soon.
  if (product.status === "coming_soon") return "coming_soon";

  // Status diferente de "published" não aparece (draft/hidden/etc).
  if (product.status && product.status !== "published") return "hidden";

  // launch_date no futuro = coming_soon.
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
