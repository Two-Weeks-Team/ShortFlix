import { Skeleton } from "@/components/today/skeleton";
import { copy } from "@/lib/copy";

export default function Loading() {
  return (
    <section className="space-y-6">
      <p
        role="status"
        aria-live="polite"
        className="font-mono text-xs uppercase tracking-widest text-muted"
      >
        {copy.states.loading}
      </p>
      <Skeleton.Grid />
    </section>
  );
}
