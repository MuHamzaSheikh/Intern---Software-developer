import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { getOrganization, listMembers } from "../features/organizations/api";
import { InviteMemberForm } from "../features/organizations/invite-member-form";
import {
  organizationTypeBadgeClasses,
  organizationTypeLabels,
} from "../features/organizations/schemas";

export function OrganizationDetailPage() {
  const { organizationId } = useParams();
  const id = organizationId ?? "";
  const organizationQuery = useQuery({
    queryKey: ["organization", id],
    queryFn: () => getOrganization(id),
    enabled: Boolean(id),
  });
  const membersQuery = useQuery({
    queryKey: ["members", id],
    queryFn: () => listMembers(id),
    enabled: Boolean(id),
  });

  if (organizationQuery.isLoading) {
    return <StateCard message="Loading organization..." />;
  }

  if (organizationQuery.isError) {
    return <StateCard message={organizationQuery.error.message} tone="error" />;
  }

  const organization = organizationQuery.data;

  if (!organization) {
    return <StateCard message="Organization not found." tone="error" />;
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Back to organizations
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-slate-950">{organization.name}</h1>
            <Badge className={organizationTypeBadgeClasses[organization.type]}>
              {organizationTypeLabels[organization.type]}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-600">{typeSpecificLabel(organization)}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-950">Invite member</h2>
          <p className="mt-1 text-sm text-slate-600">
            Invitations are validated server-side before records are created.
          </p>
        </CardHeader>
        <CardContent>
          <InviteMemberForm organizationId={organization.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Members</h2>
            <p className="mt-1 text-sm text-slate-600">Invited and active members for this organization.</p>
          </div>
          <Users className="h-5 w-5 text-slate-400" />
        </CardHeader>
        <CardContent className="p-0">
          {membersQuery.isLoading ? <div className="p-5 text-sm text-slate-600">Loading members...</div> : null}
          {membersQuery.isError ? (
            <div className="p-5 text-sm text-red-700">{membersQuery.error.message}</div>
          ) : null}
          {membersQuery.isSuccess && membersQuery.data.length === 0 ? (
            <div className="p-5 text-sm text-slate-600">No members invited yet.</div>
          ) : null}
          {membersQuery.isSuccess && membersQuery.data.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {membersQuery.data.map((member) => (
                <div
                  className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  key={member.id}
                >
                  <span className="font-medium text-slate-950">{member.email}</span>
                  <Badge className="bg-slate-50 text-slate-700">{member.role}</Badge>
                  <Badge
                    className={
                      member.status === "active"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-blue-200 bg-blue-50 text-blue-700"
                    }
                  >
                    {member.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function StateCard({ message, tone = "neutral" }: { message: string; tone?: "neutral" | "error" }) {
  return (
    <Card>
      <CardContent className={tone === "error" ? "text-red-700" : "text-slate-600"}>
        {message}
      </CardContent>
    </Card>
  );
}

function typeSpecificLabel(organization: {
  type: "school" | "nonprofit" | "business";
  school_district: string | null;
  nonprofit_cause: string | null;
  business_industry: string | null;
}) {
  if (organization.type === "school") return `District: ${organization.school_district}`;
  if (organization.type === "nonprofit") return `Cause: ${organization.nonprofit_cause}`;
  return `Industry: ${organization.business_industry}`;
}
