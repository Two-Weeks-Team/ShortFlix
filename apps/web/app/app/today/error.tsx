"use client";

import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";

export default function TodayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section
      role="alert"
      className="rounded-2xl border border-warn/40 bg-warn/10 p-6 text-sm text-warn"
    >
      <p className="font-editorial text-lg font-semibold">
        {copy.states.error}
      </p>
      <p className="mt-1 text-muted">{error.message}</p>
      <div className="mt-4">
        <Button variant="secondary" size="sm" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </section>
  );
}
