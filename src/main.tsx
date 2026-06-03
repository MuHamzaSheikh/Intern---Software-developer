import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./features/auth/auth-provider";
import { ProtectedRoute } from "./features/auth/protected-route";
import { AuthPage } from "./routes/auth-page";
import { CreateOrganizationPage } from "./routes/create-organization-page";
import { OrganizationDetailPage } from "./routes/organization-detail-page";
import { OrganizationsPage } from "./routes/organizations-page";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<OrganizationsPage />} />
              <Route path="/organizations/new" element={<CreateOrganizationPage />} />
              <Route path="/organizations/:organizationId" element={<OrganizationDetailPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
