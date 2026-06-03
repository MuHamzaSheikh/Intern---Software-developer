import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../features/auth/auth-provider";
import { supabase } from "../lib/supabase";

const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type AuthInput = z.infer<typeof authSchema>;

export function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";
  const form = useForm<AuthInput>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values: AuthInput) {
    setIsSubmitting(true);
    const authCall =
      mode === "signin"
        ? supabase.auth.signInWithPassword(values)
        : supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: { data: { is_admin: true } },
          });

    const { error } = await authCall;
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(mode === "signin" ? "Signed in." : "Admin account created.");
    navigate(destination, { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-600 text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Impact Admin</h1>
            <p className="mt-1 text-sm text-slate-600">
              {mode === "signin" ? "Sign in to manage organizations." : "Create an admin account."}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="field-error">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password ? (
                <p className="field-error">{form.formState.errors.password.message}</p>
              ) : null}
            </div>
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
            </Button>
          </form>
          <button
            className="mt-5 w-full text-center text-sm font-medium text-blue-700 hover:text-blue-800"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            type="button"
          >
            {mode === "signin" ? "Need an admin account? Sign up" : "Already have an account? Sign in"}
          </button>
        </CardContent>
      </Card>
    </main>
  );
}
