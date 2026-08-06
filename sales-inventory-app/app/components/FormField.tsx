import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

export function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <input id={name} name={name} className={inputClass} {...props} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  children,
  ...props
}: { label: string; name: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <select id={name} name={name} className={inputClass} {...props}>
        {children}
      </select>
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  ...props
}: { label: string; name: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <textarea id={name} name={name} className={inputClass} {...props} />
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-md bg-red-50 dark:bg-red-950 px-3 py-2 text-sm text-red-700 dark:text-red-300">
      {message}
    </p>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-3 pt-2">{children}</div>;
}

export function SubmitButton({
  children,
  pending,
  variant = "primary",
}: {
  children: ReactNode;
  pending?: boolean;
  variant?: "primary" | "danger";
}) {
  const base = "rounded-md px-4 py-2 text-sm font-semibold shadow-sm disabled:opacity-60";
  const variantClass =
    variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-500"
      : "bg-blue-600 text-white hover:bg-blue-500";
  return (
    <button type="submit" disabled={pending} className={`${base} ${variantClass}`}>
      {pending ? "Saving..." : children}
    </button>
  );
}
