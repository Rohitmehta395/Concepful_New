export function WorkHero() {
  return (
    <section className="border-b border-border/40 py-20 px-6">
      <div className="container mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Selected Work</p>
        <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
          What we build<br className="hidden md:block" /> for our clients.
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
          From Figma flows for drone operations platforms to brand systems, launch campaigns, and motion — brief outputs, real context.
        </p>
      </div>
    </section>
  );
}
