import { Component, ReactNode } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center animate-fade-in">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertTriangle className="h-7 w-7 text-destructive" aria-hidden />
        </div>
        <h1 className="mt-4 font-heading text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We hit an unexpected error. Try reloading the page — your data is safe.
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" onClick={this.reset}>
            Try again
          </Button>
          <Button onClick={() => window.location.assign("/")} className="gap-2">
            <RotateCw className="h-4 w-4" />
            Reload home
          </Button>
        </div>
      </div>
    );
  }
}
