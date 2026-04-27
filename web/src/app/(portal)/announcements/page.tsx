"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { formatDate, cn } from "@/lib/utils";
import { Megaphone, Plus } from "lucide-react";
import AddAnnouncementModal from "./AddAnnouncementModal";

const PRIORITY_STYLE = {
  LOW: { bg: "bg-bg", text: "text-muted", border: "border-border-c", dot: "bg-muted" },
  NORMAL: { bg: "bg-blue-bg", text: "text-blue-text", border: "border-blue-border", dot: "bg-accent-blue" },
  HIGH: { bg: "bg-amber-bg", text: "text-amber-text", border: "border-amber-border", dot: "bg-accent-amber" },
  URGENT: { bg: "bg-coral-bg", text: "text-coral-text", border: "border-coral-border", dot: "bg-accent-coral" },
};

export default function AnnouncementsPage() {
  const { token, isAdmin } = useAuthStore();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:4000/api/announcements", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
         if(Array.isArray(data)) setAnnouncements(data);
      })
      .catch(console.error);
  }, [token]);

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[42px] font-normal tracking-tight text-text leading-none">
            <em className="text-accent-blue">Announcements</em>
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Team updates and important notices
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-accent-blue text-white rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-2 hover:bg-[#2A5ED4] transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> New Announcement
          </button>
        )}
      </div>

      <div className="space-y-4 max-w-[700px]">
        {announcements.length === 0 ? (
          <div className="text-sm text-muted">No announcements yet.</div>
        ) : (
          announcements.map((ann, i) => {
          const style = PRIORITY_STYLE[ann.priority];
          return (
            <div
              key={ann.id}
              className={cn("animate-fade-up rounded-[var(--radius)] border bg-surface p-6 transition-all hover:shadow-md", style.border)}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="mb-3 flex items-center gap-3">
                <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", style.bg, style.text)}>
                  {ann.priority}
                </span>
                <span className="text-[11px] text-muted">{formatDate(ann.createdAt, "relative")}</span>
                {ann.author && (
                  <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white" style={{ background: ann.author.avatarGradient }}>
                      {ann.author.initials}
                    </div>
                    {ann.author.firstName} {ann.author.lastName[0]}.
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold mb-2">{ann.title}</h3>
              <p className="text-[13px] leading-relaxed text-muted whitespace-pre-wrap">{ann.body}</p>
            </div>
          );
        }))}
      </div>

      {showAddModal && (
        <AddAnnouncementModal
          onClose={() => setShowAddModal(false)}
          onAdded={(a) => setAnnouncements([a, ...announcements])}
        />
      )}
    </div>
  );
}
