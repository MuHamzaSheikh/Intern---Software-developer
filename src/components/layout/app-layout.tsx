import { Building2, LogOut, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../features/auth/auth-provider";

export function AppLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2 font-semibold text-slate-950" to="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white">
              <Building2 className="h-5 w-5" />
            </span>
            Impact Admin
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:text-slate-950"
                }`
              }
              to="/"
            >
              Organizations
            </NavLink>
            <Button asChild size="sm">
              <Link to="/organizations/new">
                <Plus className="h-4 w-4" />
                New organization
              </Link>
            </Button>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-52 truncate text-sm text-slate-600 sm:block">
              {user?.email}
            </span>
            <Button aria-label="Sign out" onClick={() => void signOut()} size="icon" variant="ghost">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
