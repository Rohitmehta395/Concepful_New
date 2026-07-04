import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function WorkCTA() {
  return (
    <section className="border-t border-border/40 px-6 py-20">
      <div className="container mx-auto max-w-5xl text-center">
        <h2 className="font-serif text-3xl font-bold mb-4">Your work could be next.</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Concepful clients get a full creative department on a monthly retainer — no briefs lost in inboxes, no agency markup.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
        >
          See plans <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
