import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function Layout({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
