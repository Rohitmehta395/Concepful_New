import Link from "next/link";
import {
  Layers,
  Palette,
  Globe,
  Megaphone,
  Monitor,
  PenTool,
  Lightbulb,
  FileText,
  Sparkles,
  ArrowUpRight,
  Infinity,
  Clock,
  Unlock,
  Users,
} from "lucide-react";

const SERVICE_GROUPS = [
  {
    label: "Design & Product",
    items: [
      {
        icon: Monitor,
        label: "Product Design",
        description:
          "Digital products that are usable, intuitive and built to convert.",
        href: "/work#product-design",
      },
      {
        icon: Layers,
        label: "UI / UX Design",
        description:
          "Beautiful interfaces and seamless experiences that users love.",
        href: "/work#ui-ux-design",
      },
      {
        icon: Globe,
        label: "Web Design",
        description:
          "Modern, responsive websites that represent your brand and drive results.",
        href: "/work#web-design",
      },
    ],
  },
  {
    label: "Brand & Story",
    items: [
      {
        icon: Palette,
        label: "Brand Identity",
        description:
          "Logos, style guides and visual systems that build strong, recognizable brands.",
        href: "/work#brand-identity",
      },
      {
        icon: PenTool,
        label: "Creative Direction",
        description:
          "Clear ideas and creative leadership that align everything with your brand vision.",
        href: "/work#creative-direction",
      },
      {
        icon: Lightbulb,
        label: "Concept Development",
        description:
          "Original concepts and strategies that turn ideas into impactful solutions.",
        href: "/work#concept-development",
      },
    ],
  },
  {
    label: "Content & Campaigns",
    items: [
      {
        icon: Megaphone,
        label: "Campaigns",
        description:
          "End-to-end campaigns that capture attention and drive engagement.",
        href: "/work#campaigns",
      },
      {
        icon: Sparkles,
        label: "Marketing Assets",
        description:
          "Social media, ads and digital assets that strengthen your marketing.",
        href: "/work#marketing-assets",
      },
      {
        icon: FileText,
        label: "Presentations",
        description:
          "Pitch decks and business presentations that inspire confidence and close deals.",
        href: "/work#presentations",
      },
    ],
  },
];

const STATS = [
  { icon: Infinity, value: "Unlimited", caption: "Add as many requests as you need." },
  { icon: Clock, value: "24 hours", caption: "Most requests delivered within a day." },
  { icon: Unlock, value: "Cancel anytime", caption: "No contracts. Total flexibility." },
  { icon: Users, value: "Dedicated team", caption: "Experts who understand your brand." },
];

export function Capabilities() {
  return (
    <section className="border-b border-slate-200 bg-[#fafafa] px-6 py-24">
      <div className="container mx-auto max-w-[1200px]">
        <div className="mx-auto mb-20 max-w-2xl text-center">
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.15em] text-primary">
            What you can build
          </p>
          <h2 className="mb-6 font-serif text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            One Team. Every <span className="text-primary">Creative</span>{" "}
            Discipline.
          </h2>
          <p className="text-lg leading-relaxed font-normal text-slate-500 md:text-md">
            We're not selling deliverables — we're selling creative capability.
            Your team handles whatever you need, as you need it.
          </p>
        </div>

        {/* Services, grouped by discipline — three real categories. */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-3 lg:gap-y-0">
          {SERVICE_GROUPS.map((group, groupIdx) => (
            <div
              key={group.label}
              className={
                groupIdx > 0
                  ? "border-t border-slate-200 pt-10 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12"
                  : ""
              }
            >
              <p className="mb-7 text-xs font-bold uppercase tracking-[0.15em] text-primary">
                {group.label}
              </p>
              <ul className="flex flex-col gap-2">
                {group.items.map(({ icon: Icon, label, description, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group -mx-3 flex gap-4 rounded-xl px-3 py-3 transition-colors duration-300 hover:bg-primary/[0.05] focus-visible:bg-primary/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <Icon
                        className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition-colors duration-300 group-hover:text-primary"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-1.5">
                          <p className="font-semibold tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-primary">
                            {label}
                          </p>
                          <ArrowUpRight
                            className="h-3.5 w-3.5 -translate-x-1 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-[14px] leading-relaxed text-slate-500">
                          {description}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stat strip */}
        <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-slate-200 pt-12 md:grid-cols-4 md:gap-15 lg:divide-x lg:divide-slate-200">
          {STATS.map((stat, i) => (
            <div key={stat.value} className={i !== 0 ? "lg:pl-5" : ""}>
              <stat.icon className="mb-4 h-7 w-7 text-primary" strokeWidth={1.5} />
              <p className="mb-1.5 font-serif text-2xl font-medium tracking-tight text-slate-900 md:text-3xl">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500">{stat.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
