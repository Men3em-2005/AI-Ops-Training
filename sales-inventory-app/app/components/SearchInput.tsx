"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

export default function SearchInput({
  paramName = "q",
  placeholder = "Search...",
}: {
  paramName?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  return (
    <input
      type="search"
      defaultValue={searchParams.get(paramName) ?? ""}
      placeholder={placeholder}
      className="w-full max-w-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) {
          params.set(paramName, e.target.value);
        } else {
          params.delete(paramName);
        }
        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`);
        });
      }}
    />
  );
}
