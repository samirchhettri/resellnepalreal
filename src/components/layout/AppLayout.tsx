import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { usePresenceHeartbeat } from "@/hooks/usePresence";

export const AppLayout = () => {
  usePresenceHeartbeat();
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only-focusable absolute left-2 top-2 z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-md"
      >
        Skip to content
      </a>
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-screen-md flex-1 px-4 py-4 animate-fade-in focus:outline-none"
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
