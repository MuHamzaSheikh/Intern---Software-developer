import { z } from "zod";
import type { OrganizationType } from "../../lib/database.types";

export const organizationTypeLabels: Record<OrganizationType, string> = {
  school: "School",
  nonprofit: "Nonprofit",
  business: "Business",
};

export const organizationTypeBadgeClasses: Record<OrganizationType, string> = {
  school: "border-sky-200 bg-sky-50 text-sky-700",
  nonprofit: "border-emerald-200 bg-emerald-50 text-emerald-700",
  business: "border-amber-200 bg-amber-50 text-amber-700",
};

export const createOrganizationSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    type: z.enum(["school", "nonprofit", "business"]),
    schoolDistrict: z.string().trim().optional(),
    nonprofitCause: z.string().trim().optional(),
    businessIndustry: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    if (value.type === "school" && !value.schoolDistrict) {
      context.addIssue({
        code: "custom",
        message: "School district is required for schools.",
        path: ["schoolDistrict"],
      });
    }

    if (value.type === "nonprofit" && !value.nonprofitCause) {
      context.addIssue({
        code: "custom",
        message: "Primary cause is required for nonprofits.",
        path: ["nonprofitCause"],
      });
    }

    if (value.type === "business" && !value.businessIndustry) {
      context.addIssue({
        code: "custom",
        message: "Industry is required for businesses.",
        path: ["businessIndustry"],
      });
    }
  });

export const inviteMemberSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
