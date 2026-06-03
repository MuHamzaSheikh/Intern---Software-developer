import type {
  Organization,
  OrganizationMember,
  OrganizationWithCount,
} from "../../lib/database.types";
import { supabase } from "../../lib/supabase";
import type { CreateOrganizationInput, InviteMemberInput } from "./schemas";

function required<T>(value: T | null | undefined, message: string): T {
  if (!value) {
    throw new Error(message);
  }

  return value;
}

export async function listOrganizations() {
  const { data, error } = await supabase
    .from("organizations_with_member_counts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as OrganizationWithCount[];
}

export async function getOrganization(organizationId: string) {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", organizationId)
    .single();

  if (error) {
    throw error;
  }

  return data as Organization;
}

export async function listMembers(organizationId: string) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)
    .order("invited_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as OrganizationMember[];
}

export async function createOrganization(input: CreateOrganizationInput) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const createdBy = required(user?.id, "You must be signed in to create an organization.");

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name: input.name,
      type: input.type,
      created_by: createdBy,
      school_district: input.type === "school" ? input.schoolDistrict ?? null : null,
      nonprofit_cause: input.type === "nonprofit" ? input.nonprofitCause ?? null : null,
      business_industry: input.type === "business" ? input.businessIndustry ?? null : null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Organization;
}

export async function inviteMember(organizationId: string, input: InviteMemberInput) {
  const { data, error } = await supabase.functions.invoke<OrganizationMember>("invite-member", {
    body: {
      organizationId,
      email: input.email,
    },
  });

  if (error) {
    throw error;
  }

  return required(data, "Invitation could not be created.");
}
