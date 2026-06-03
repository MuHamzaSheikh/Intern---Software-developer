import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { listOrganizations } from "../features/organizations/api";
import {
  organizationTypeBadgeClasses,
  organizationTypeLabels,
} from "../features/organizations/schemas";

export function OrganizationsPage() {
  const organizationsQuery = useQuery({
    queryKey: ["organizations"],
    queryFn: listOrganizations,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-700">Admin workspace</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">Organizations</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage the organizations you created and track invited members.
          </p>
        </div>
        <Button asChild>
          <Link to="/organizations/new">
            <Plus className="h-4 w-4" />
            Create organization
          </Link>
        </Button>
      </div>

      {organizationsQuery.isLoading ? <StateCard message="Loading organizations..." /> : null}
      {organizationsQuery.isError ? (
        <StateCard message={organizationsQuery.error.message} tone="error" />
      ) : null}
      {organizationsQuery.isSuccess && organizationsQuery.data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <Building2 className="h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold text-slate-950">No organizations yet</h2>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              Create your first school, nonprofit, or business to start inviting members.
            </p>
            <Button asChild className="mt-5">
              <Link to="/organizations/new">Create organization</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
      {organizationsQuery.isSuccess && organizationsQuery.data.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_40px] border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase text-slate-500 md:grid">
            <span>Name</span>
            <span>Type</span>
            <span>Members</span>
            <span>Created</span>
            <span />
          </div>
          <div className="divide-y divide-slate-100">
            {organizationsQuery.data.map((organization) => (
              <Link
                className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[1.5fr_1fr_1fr_1fr_40px] md:items-center"
                key={organization.id}
                to={`/organizations/${organization.id}`}
              >
                <div>
                  <p className="font-medium text-slate-950">{organization.name}</p>
                  <p className="mt-1 text-sm text-slate-500 md:hidden">
                    {formatTypeSpecificValue(organization)}
                  </p>
                </div>
                <Badge className={organizationTypeBadgeClasses[organization.type]}>
                  {organizationTypeLabels[organization.type]}
                </Badge>
                <span className="text-sm text-slate-600">{organization.member_count} members</span>
                <span className="text-sm text-slate-600">
                  {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                    new Date(organization.created_at),
                  )}
                </span>
                <ArrowRight className="hidden h-4 w-4 justify-self-end text-slate-400 md:block" />
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
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

function formatTypeSpecificValue(organization: {
  type: "school" | "nonprofit" | "business";
  school_district: string | null;
  nonprofit_cause: string | null;
  business_industry: string | null;
}) {
  if (organization.type === "school") return organization.school_district;
  if (organization.type === "nonprofit") return organization.nonprofit_cause;
  return organization.business_industry;
}
