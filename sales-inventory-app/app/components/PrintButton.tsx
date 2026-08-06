"use client";

import { buttonSecondary } from "@/app/components/ui";

export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonSecondary}>
      Print Receipt
    </button>
  );
}
