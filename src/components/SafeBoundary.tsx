import { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Local error boundary — guarantees a route never renders a blank screen
 * even if a child component throws synchronously during render.
 */
export class SafeBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || "Erro inesperado" };
  }

  componentDidCatch(error: Error) {
    console.error("[SafeBoundary] Render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 rounded-3xl border border-border/30 bg-card/20 px-6 py-16 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
          <h2 className="font-display text-lg font-semibold text-foreground">
            {this.props.fallbackTitle || "Erro ao carregar a página"}
          </h2>
          <p className="text-sm text-muted-foreground/70">{this.state.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
