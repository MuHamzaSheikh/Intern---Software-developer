import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MailPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { inviteMember } from "./api";
import { inviteMemberSchema, type InviteMemberInput } from "./schemas";

export function InviteMemberForm({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient();
  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "" },
  });
  const mutation = useMutation({
    mutationFn: (input: InviteMemberInput) => inviteMember(organizationId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["members", organizationId] }),
        queryClient.invalidateQueries({ queryKey: ["organizations"] }),
      ]);
      form.reset();
      toast.success("Invitation created.");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_auto]"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <div>
        <label className="field-label" htmlFor="member-email">
          Invite by email
        </label>
        <Input
          className="mt-2"
          id="member-email"
          placeholder="member@example.com"
          type="email"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="field-error mt-2">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <Button className="self-end" disabled={mutation.isPending} type="submit">
        <MailPlus className="h-4 w-4" />
        {mutation.isPending ? "Inviting..." : "Invite"}
      </Button>
    </form>
  );
}
