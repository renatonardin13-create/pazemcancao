import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { endImpersonation } from "@/lib/impersonation.functions";
import { toast } from "sonner";

const STORAGE_KEY = "paz-impersonation";

export type ImpersonationState = {
  logId: string | null;
  adminEmail: string;
  targetEmail: string;
  startedAt: string;
};

export function setImpersonationState(state: ImpersonationState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  // Notifica listeners no mesmo tab
  window.dispatchEvent(new Event("paz-impersonation-change"));
}

export function clearImpersonationState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("paz-impersonation-change"));
}

function readImpersonationState(): ImpersonationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ImpersonationState;
  } catch {
    return null;
  }
}

export function ImpersonationBanner() {
  const [state, setState] = useState<ImpersonationState | null>(null);
  const [ending, setEnding] = useState(false);
  const endFn = useServerFn(endImpersonation);
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setState(readImpersonationState());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("paz-impersonation-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("paz-impersonation-change", sync);
    };
  }, []);

  if (!state) return null;

  const handleEnd = async () => {
    setEnding(true);
    try {
      if (state.logId) {
        try {
          await endFn({ data: { logId: state.logId } });
        } catch (err) {
          console.error("Erro ao encerrar log de impersonação", err);
        }
      }
      clearImpersonationState();
      await supabase.auth.signOut();
      toast.success("Impersonação encerrada. Faça login novamente como admin.");
      navigate({ to: "/login" });
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="sticky top-0 z-[100] w-full bg-amber-500 text-black shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-semibold">
          <Eye className="h-4 w-4" />
          <span>
            Modo impersonação — visualizando como{" "}
            <span className="font-bold underline">{state.targetEmail}</span>
            <span className="ml-2 hidden text-black/70 sm:inline">
              (admin: {state.adminEmail})
            </span>
          </span>
        </div>
        <button
          onClick={handleEnd}
          disabled={ending}
          className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-bold text-amber-300 transition-colors hover:bg-black/85 disabled:opacity-60"
        >
          <LogOut className="h-3.5 w-3.5" />
          {ending ? "Encerrando..." : "Encerrar impersonação"}
        </button>
      </div>
    </div>
  );
}
