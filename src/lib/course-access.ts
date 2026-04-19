import type { VitrineCourse } from "@/components/vitrine/types";

export type CourseAccessState = "unlocked" | "coming_soon" | "locked";

/**
 * Função central de acesso ao curso na vitrine.
 * Concentra TODA a lógica para evitar inconsistências.
 */
export function getCourseAccessState(course: VitrineCourse): CourseAccessState {
  const state = course.access_state;
  if (state === "enrolled" || state === "owned" || state === "unlocked") return "unlocked";
  if (state === "coming_soon") return "coming_soon";
  return "locked";
}

export function isCourseUnlocked(course: VitrineCourse): boolean {
  return getCourseAccessState(course) === "unlocked";
}

export function formatBRL(value?: number | null): string | null {
  if (value == null || isNaN(Number(value)) || Number(value) <= 0) return null;
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
