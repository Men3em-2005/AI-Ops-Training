"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionState } from "@/lib/types";
import { FormError, SubmitButton } from "@/app/components/FormField";

type ActionFn = (prevState: ActionState, formData: FormData) => Promise<ActionState>;

export default function ActionForm({
  action,
  children,
  submitLabel = "Save",
  submitVariant = "primary",
  extraButtons,
  className = "space-y-4",
}: {
  action: ActionFn;
  children: ReactNode;
  submitLabel?: string;
  submitVariant?: "primary" | "danger";
  extraButtons?: ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className={className}>
      {children}
      <FormError message={state?.error} />
      <div className="flex items-center gap-3 pt-2">
        <SubmitButton pending={pending} variant={submitVariant}>
          {submitLabel}
        </SubmitButton>
        {extraButtons}
      </div>
    </form>
  );
}
