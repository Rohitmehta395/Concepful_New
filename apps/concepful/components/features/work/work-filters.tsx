import type { CaseStudy } from "@/lib/content/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";

interface WorkFiltersProps {
  filters: { id: string; label: string }[];
  caseStudies: CaseStudy[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  filteredCount: number;
}

export function WorkFilters({
  filters,
  caseStudies,
  activeFilter,
  onFilterChange,
  filteredCount,
}: WorkFiltersProps) {
  return (
    <section className="pt-16 pb-6 px-6 bg-background">
      <div className="container mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-border/40 pb-6">
        <div>
          <div className="mb-2.5 inline-flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              {filteredCount} {filteredCount === 1 ? "Project" : "Projects"}
            </span>
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            More of our work
          </h2>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-end">
          <label
            htmlFor="work-filter"
            className="text-sm font-medium text-muted-foreground shrink-0"
          >
            Filter
          </label>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex h-10 w-44 sm:w-48 items-center justify-between whitespace-nowrap rounded-lg border border-input bg-card/60 hover:bg-card px-3.5 py-2 text-sm shadow-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
              <span className="truncate font-medium">
                {filters.find((f) => f.id === activeFilter)?.label ?? "Select a category"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52" align="end">
              {filters.map((f) => {
                const isAll = f.id === "all";
                const count = isAll
                  ? caseStudies.length
                  : caseStudies.filter((cs) => cs.category?.slug === f.id).length;
                const isSelected = activeFilter === f.id;

                return (
                  <DropdownMenuItem 
                    key={f.id} 
                    onSelect={() => onFilterChange(f.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>{f.label}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {count}
                      </span>
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </section>
  );
}
