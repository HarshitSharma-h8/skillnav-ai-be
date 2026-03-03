import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  Target,
  FileText,
  GraduationCap,
  LineChart,
  LogOut
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Career Guidance", href: "/guidance", icon: Compass },
  { name: "Skill Gap Analysis", href: "/skill-gap", icon: Target },
  { name: "Resume Analyzer", href: "/resume", icon: FileText },
  { name: "Training Hub", href: "/training", icon: GraduationCap },
  { name: "Market Insights", href: "/market", icon: LineChart },
];

interface User {
  name: string;
  email: string;
  picture: string;
}

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setUser(data);
          }
        })
        .catch(console.error);
    }
  }, []);

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Target className="h-6 w-6" />
          <span>SkillNav AI</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-blue-700" : "text-slate-400",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              user?.name?.charAt(0) || "U"
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-slate-900 truncate">
              {user?.name || "User"}
            </span>
            <span className="text-xs text-slate-500 truncate">{user?.email || "user@example.com"}</span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600"
        >
          <LogOut className="h-5 w-5 text-slate-400" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
