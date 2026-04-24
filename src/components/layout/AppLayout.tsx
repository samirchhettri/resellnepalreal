import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export const AppLayout = () => {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-screen-md flex-1 px-4 py-4 animate-fade-in">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
