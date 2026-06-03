import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

type InvitePayload = {
  organizationId?: string;
  email?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ error: "Supabase environment is not configured." }, 500);
  }

  const authHeader = request.headers.get("Authorization") ?? "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: "Authentication required." }, 401);
  }

  let payload: InvitePayload;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON payload." }, 400);
  }

  const organizationId = payload.organizationId?.trim();
  const email = payload.email?.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!organizationId || !email || !emailPattern.test(email)) {
    return jsonResponse({ error: "A valid organization and email are required." }, 400);
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id, created_by")
    .eq("id", organizationId)
    .single();

  if (organizationError || !organization) {
    return jsonResponse({ error: "Organization not found." }, 404);
  }

  if (organization.created_by !== user.id) {
    return jsonResponse({ error: "You can only invite members to organizations you manage." }, 403);
  }

  const { data, error } = await supabase
    .from("organization_members")
    .insert({
      organization_id: organizationId,
      email,
      status: "invited",
      role: "member",
      user_id: null,
      joined_at: null,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return jsonResponse({ error: "This email has already been invited to the organization." }, 409);
    }

    return jsonResponse({ error: error.message }, 400);
  }

  return jsonResponse(data, 201);
});
