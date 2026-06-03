import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppLayout } from "../../components/layout/app-layout";
import { useAuth } from "./auth-provider";

export function ProtectedRoute() {
  const { isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
        Checking admin session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
