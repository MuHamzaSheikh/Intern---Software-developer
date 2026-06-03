import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { createOrganization } from "./api";
import {
  createOrganizationSchema,
  organizationTypeLabels,
  type CreateOrganizationInput,
} from "./schemas";

export function OrganizationForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      type: "school",
      schoolDistrict: "",
      nonprofitCause: "",
      businessIndustry: "",
    },
  });
  const selectedType = form.watch("type");
  const mutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: async (organization) => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organization created.");
      navigate(`/organizations/${organization.id}`);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-950">Create organization</h1>
            <p className="text-sm text-slate-600">Type-specific fields keep the directory useful.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-2">
            <label className="field-label" htmlFor="name">
              Organization name
            </label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="field-error">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label className="field-label">Organization type</label>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(organizationTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {selectedType === "school" ? (
            <ConditionalField
              error={form.formState.errors.schoolDistrict?.message}
              label="School district"
              registration={form.register("schoolDistrict")}
            />
          ) : null}
          {selectedType === "nonprofit" ? (
            <ConditionalField
              error={form.formState.errors.nonprofitCause?.message}
              label="Primary cause"
              registration={form.register("nonprofitCause")}
            />
          ) : null}
          {selectedType === "business" ? (
            <ConditionalField
              error={form.formState.errors.businessIndustry?.message}
              label="Industry"
              registration={form.register("businessIndustry")}
            />
          ) : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button onClick={() => navigate("/")} type="button" variant="secondary">
              Cancel
            </Button>
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending ? "Creating..." : "Create organization"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ConditionalField({
  error,
  label,
  registration,
}: {
  error?: string;
  label: string;
  registration: ReturnType<typeof useForm<CreateOrganizationInput>>["register"] extends (
    name: infer _Name,
  ) => infer RegisterReturn
    ? RegisterReturn
    : never;
}) {
  return (
    <div className="grid gap-2">
      <label className="field-label">{label}</label>
      <Input {...registration} />
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
