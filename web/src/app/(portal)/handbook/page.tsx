"use client";

import { useState } from "react";
import { MOCK_HANDBOOK } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, ChevronRight } from "lucide-react";

export default function HandbookPage() {
  const [activeSlug, setActiveSlug] = useState(MOCK_HANDBOOK[0]?.slug || "");
  const [search, setSearch] = useState("");

  const categories = [...new Set(MOCK_HANDBOOK.map((s) => s.category))];
  const active = MOCK_HANDBOOK.find((s) => s.slug === activeSlug);

  const filtered = search
    ? MOCK_HANDBOOK.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()) || s.content.toLowerCase().includes(search.toLowerCase()))
    : MOCK_HANDBOOK;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-[42px] font-normal tracking-tight text-text leading-none">
          Company <em className="text-accent-blue">Handbook</em>
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          Policies, processes, and everything you need to know
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar TOC */}
        <div className="w-[240px] shrink-0">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search handbook…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border-c bg-surface py-2 pl-8 pr-3 text-xs outline-none focus:border-accent-blue"
            />
          </div>

          <nav className="space-y-4">
            {categories.map((cat) => {
              const sections = filtered.filter((s) => s.category === cat);
              if (sections.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    {cat}
                  </div>
                  {sections.map((section) => (
                    <button
                      key={section.slug}
                      onClick={() => setActiveSlug(section.slug)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-all",
                        activeSlug === section.slug
                          ? "bg-accent-blue/10 font-medium text-accent-blue"
                          : "text-muted hover:bg-bg hover:text-text"
                      )}
                    >
                      <span className="text-sm">{section.icon}</span>
                      {section.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 animate-fade-up rounded-[var(--radius)] border border-border-c bg-surface p-8">
          {active ? (
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="text-2xl">{active.icon}</span>
                <div>
                  <h2 className="font-display text-2xl font-light">{active.title}</h2>
                  <div className="text-xs text-muted">{active.category}</div>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                {active.content.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) {
                    return <h3 key={i} className="mt-6 mb-3 font-display text-lg font-semibold">{line.replace("## ", "")}</h3>;
                  }
                  if (line.startsWith("- **")) {
                    const match = line.match(/- \*\*(.+?)\*\* — (.+)/);
                    if (match) {
                      return (
                        <div key={i} className="flex gap-2 py-1.5 border-b border-border-c last:border-0">
                          <span className="font-semibold text-[13px] min-w-[160px]">{match[1]}</span>
                          <span className="text-[13px] text-muted">{match[2]}</span>
                        </div>
                      );
                    }
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <div key={i} className="flex items-start gap-2 py-1">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent-blue shrink-0" />
                        <span className="text-[13px] leading-relaxed">{line.replace("- ", "")}</span>
                      </div>
                    );
                  }
                  if (line.startsWith("| ") && line.includes("|")) {
                    const cells = line.split("|").filter(Boolean).map((c) => c.trim());
                    if (cells.every((c) => c.match(/^-+$/))) return null;
                    const isHeader = i > 0 && active.content.split("\n")[i + 1]?.match(/^\|[\s-|]+$/);
                    return (
                      <div key={i} className={cn("flex gap-4 py-2 border-b border-border-c", isHeader && "font-semibold text-xs uppercase tracking-wider text-muted")}>
                        {cells.map((cell, j) => (
                          <span key={j} className="flex-1 text-[13px]">{cell}</span>
                        ))}
                      </div>
                    );
                  }
                  if (line.startsWith("1. ") || line.match(/^\d+\. /)) {
                    const num = line.match(/^(\d+)\. /)?.[1];
                    const text = line.replace(/^\d+\. /, "");
                    return (
                      <div key={i} className="flex items-start gap-3 py-1.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-blue/10 text-[10px] font-bold text-accent-blue shrink-0">{num}</span>
                        <span className="text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                    );
                  }
                  if (line.trim() === "") return <div key={i} className="h-3" />;
                  return <p key={i} className="text-[13px] leading-relaxed text-text/80">{line}</p>;
                })}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-muted">
              <span className="text-4xl block mb-3">📖</span>
              Select a section to read
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
