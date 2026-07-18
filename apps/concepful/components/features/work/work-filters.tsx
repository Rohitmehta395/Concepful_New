import type { CaseStudy } from "@/data/case-studies";
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
    <section className="border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-40 transition-all duration-300">
      <div className="container mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <label
            htmlFor="work-filter"
            className="text-sm font-medium text-muted-foreground shrink-0"
          >
            Filter
          </label>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex h-10 w-full sm:w-52 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
              <span className="truncate">
                {filters.find((f) => f.id === activeFilter)?.label ?? "Select a category"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(100vw-3rem)] sm:w-52" align="start">
              {filters.map((f) => {
                const isAll = f.id === "all";
                const count = isAll
                  ? caseStudies.length
                  : caseStudies.filter((cs) => cs.category === f.id).length;
                const isSelected = activeFilter === f.id;

                return (
                  <DropdownMenuItem 
                    key={f.id} 
                    onSelect={() => onFilterChange(f.id)}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <span>{f.label}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {count}
                      </span>
                    </span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="shrink-0 text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">
            {filteredCount}
          </span>{" "}
          {filteredCount === 1 ? "project" : "projects"}
        </p>
      </div>
    </section>
  );
}
