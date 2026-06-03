export type OrganizationType = "school" | "nonprofit" | "business";
export type MemberStatus = "invited" | "active";
export type MemberRole = "admin" | "member";

export type Organization = {
  id: string;
  name: string;
  type: OrganizationType;
  created_by: string;
  school_district: string | null;
  nonprofit_cause: string | null;
  business_industry: string | null;
  created_at: string;
};

export type OrganizationWithCount = Organization & {
  member_count: number;
};

export type OrganizationMember = {
  id: string;
  organization_id: string;
  user_id: string | null;
  email: string;
  status: MemberStatus;
  role: MemberRole;
  invited_at: string;
  joined_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Organization, "id" | "created_by" | "created_at">>;
        Relationships: [];
      };
      organization_members: {
        Row: OrganizationMember;
        Insert: Omit<OrganizationMember, "id" | "invited_at"> & {
          id?: string;
          invited_at?: string;
        };
        Update: Partial<Omit<OrganizationMember, "id" | "organization_id" | "invited_at">>;
        Relationships: [];
      };
    };
    Views: {
      organizations_with_member_counts: {
        Row: OrganizationWithCount;
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      organization_type: OrganizationType;
      member_status: MemberStatus;
      member_role: MemberRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
