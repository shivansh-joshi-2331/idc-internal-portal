"use client";

import { useAuthStore } from "@/lib/store";
import {
  MOCK_SCHEDULE,
  MOCK_LEADERBOARD,
  MOCK_CHALLENGES,
  MOCK_ANNOUNCEMENTS,
  MOCK_HOLIDAYS,
  MOCK_USERS,
} from "@/lib/mock-data";
import { getGreeting, formatDate, cn } from "@/lib/utils";
import { SHIFT_CONFIG, DEPT_CONFIG } from "@/lib/types";
import {
  Clock,
  Calendar,
  Trophy,
  Sun,
  ChevronRight,
  Zap,
  TrendingUp,
  Users,
  Megaphone,
} from "lucide-react";
import Link from "next/link";

// ─── Stat Card ───
function StatCard({
  label,
  value,
  sub,
  accentColor,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  accentColor: string;
  icon: React.ElementType;
}) {
  return (
    <div className="animate-fade-up relative overflow-hidden rounded-[var(--radius)] border border-border-c bg-surface p-5">
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accentColor }} />
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.07em] text-muted">
          {label}
        </span>
        <Icon className="h-4 w-4 text-muted opacity-50" />
      </div>
      <div className="font-serif text-[32px] font-medium leading-none tracking-tight" style={{ color: accentColor }}>
        {value}
      </div>
      <div className="mt-1.5 text-xs text-muted">{sub}</div>
    </div>
  );
}

// ─── Week Strip ───
function WeekStrip() {
  const { user } = useAuthStore();
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));

  const days = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const entry = MOCK_SCHEDULE.find(
      (s) => s.userId === user?.id && s.date === dateStr
    );
    const isToday = date.toDateString() === now.toDateString();
    const dayLabel = ["Mon", "Tue", "Wed", "Thu", "Fri"][i];
    const config = entry ? SHIFT_CONFIG[entry.type] : null;

    return { date, dateStr, entry, isToday, dayLabel, config };
  });

  return (
    <div className="animate-fade-up stagger-1 rounded-[var(--radius)] border border-border-c bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">This week</h3>
        <Link href="/schedule" className="flex items-center gap-1 text-xs text-accent-blue hover:underline">
          Full schedule <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex gap-2">
        {days.map((d) => (
          <div
            key={d.dateStr}
            className={cn(
              "flex flex-1 flex-col items-center gap-1.5 rounded-lg border p-3 transition-all",
              d.isToday
                ? "border-accent-blue/30 bg-blue-bg shadow-sm"
                : "border-border-c bg-bg"
            )}
          >
            <span className={cn("text-[10px] font-semibold uppercase", d.isToday ? "text-accent-blue" : "text-muted")}>
              {d.dayLabel}
            </span>
            <span className={cn("text-lg font-semibold", d.isToday ? "text-accent-blue" : "text-text")}>
              {d.date.getDate()}
            </span>
            {d.config && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  background: d.config.bg,
                  color: d.config.color,
                  border: `1px solid ${d.config.borderColor}`,
                }}
              >
                {d.config.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Leaderboard Preview ───
function LeaderboardPreview() {
  const { user } = useAuthStore();
  const top5 = MOCK_LEADERBOARD.slice(0, 5);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="animate-fade-up stagger-2 rounded-[var(--radius)] border border-border-c bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Leaderboard</h3>
        <Link href="/leaderboard" className="flex items-center gap-1 text-xs text-accent-blue hover:underline">
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-1">
        {top5.map((entry, i) => {
          const isMe = entry.userId === user?.id;
          return (
            <div
              key={entry.userId}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                isMe ? "bg-blue-bg border border-blue-border" : "hover:bg-bg"
              )}
            >
              <span className="w-6 text-center text-sm">
                {i < 3 ? medals[i] : <span className="font-semibold text-muted">{entry.rank}</span>}
              </span>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                style={{ background: entry.user.avatarGradient }}
              >
                {entry.user.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-[13px] font-medium">
                  {entry.user.firstName} {entry.user.lastName[0]}.
                  {isMe && <span className="ml-1.5 rounded bg-accent-blue/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent-blue">You</span>}
                </div>
              </div>
              <div className="font-serif text-xl font-medium tracking-tight">
                {entry.totalPoints}
              </div>
              <div className={cn("text-[11px] font-medium", entry.weeklyDelta >= 0 ? "text-accent-green" : "text-accent-coral")}>
                {entry.weeklyDelta >= 0 ? "+" : ""}{entry.weeklyDelta}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Challenges Preview ───
function ChallengesPreview() {
  const completed = MOCK_CHALLENGES.filter((c) => c.completed).length;
  return (
    <div className="animate-fade-up stagger-3 rounded-[var(--radius)] border border-border-c bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Weekly challenges</h3>
          <p className="mt-0.5 text-[11px] text-muted">
            {completed} of {MOCK_CHALLENGES.length} complete
          </p>
        </div>
        <span className="text-xl">🎯</span>
      </div>
      <div className="space-y-1">
        {MOCK_CHALLENGES.map((ch) => (
          <div key={ch.id} className="flex items-center gap-3 py-2">
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-content-center rounded-full text-[10px] font-bold",
                ch.completed
                  ? "bg-green-bg border border-green-border text-green-text"
                  : "bg-bg border border-border-c text-muted"
              )}
            >
              <span className="mx-auto">{ch.completed ? "✓" : "○"}</span>
            </div>
            <span className="flex-1 text-[13px]">{ch.title}</span>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                ch.completed
                  ? "bg-green-bg border border-green-border text-green-text"
                  : "bg-bg border border-border-c text-muted"
              )}
            >
              +{ch.points} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Announcements Preview ───
function AnnouncementsPreview() {
  const priorityColor = {
    LOW: "bg-bg text-muted",
    NORMAL: "bg-blue-bg text-blue-text",
    HIGH: "bg-amber-bg text-amber-text",
    URGENT: "bg-coral-bg text-coral-text",
  };

  return (
    <div className="animate-fade-up stagger-4 rounded-[var(--radius)] border border-border-c bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Announcements</h3>
        <Link href="/announcements" className="flex items-center gap-1 text-xs text-accent-blue hover:underline">
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {MOCK_ANNOUNCEMENTS.map((ann) => (
          <div key={ann.id} className="rounded-lg border border-border-c p-3.5 transition-colors hover:border-[#C8C0B0]">
            <div className="mb-1.5 flex items-center gap-2">
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", priorityColor[ann.priority])}>
                {ann.priority}
              </span>
              <span className="text-[10px] text-muted">{formatDate(ann.createdAt, "relative")}</span>
            </div>
            <div className="text-[13px] font-semibold">{ann.title}</div>
            <div className="mt-1 text-xs text-muted line-clamp-2">{ann.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Holidays Preview ───
function HolidaysPreview() {
  const upcoming = MOCK_HOLIDAYS.filter((h) => new Date(h.date) >= new Date()).slice(0, 3);

  return (
    <div className="animate-fade-up stagger-5 rounded-[var(--radius)] border border-border-c bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Upcoming holidays</h3>
        <Sun className="h-4 w-4 text-accent-amber" />
      </div>
      <div className="space-y-2">
        {upcoming.map((h) => (
          <div key={h.id} className="flex items-center gap-3 rounded-lg bg-amber-bg/50 border border-amber-border/50 px-3 py-2.5">
            <span className="text-base">🏖️</span>
            <div className="flex-1">
              <div className="text-[13px] font-medium">{h.name}</div>
              <div className="text-[11px] text-muted">{formatDate(h.date, "long")}</div>
            </div>
          </div>
        ))}
        {upcoming.length === 0 && (
          <div className="py-4 text-center text-xs text-muted">No upcoming holidays</div>
        )}
      </div>
    </div>
  );
}

// ─── Team Today Widget ───
function TeamTodayWidget() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayEntries = MOCK_SCHEDULE.filter((s) => s.date === dateStr);

  const inOffice = todayEntries.filter((s) => s.type === "IN_OFFICE");
  const remote = todayEntries.filter((s) => s.type === "REMOTE");
  const off = MOCK_USERS.length - inOffice.length - remote.length;

  return (
    <div className="animate-fade-up stagger-2 rounded-[var(--radius)] border border-border-c bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Team today</h3>
        <Users className="h-4 w-4 text-muted" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-green-bg border border-green-border p-3 text-center">
          <div className="font-serif text-3xl font-medium text-green-text">{inOffice.length}</div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-green-text/70 mt-1">In office</div>
        </div>
        <div className="rounded-lg bg-blue-bg border border-blue-border p-3 text-center">
          <div className="font-serif text-3xl font-medium text-blue-text">{remote.length}</div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-blue-text/70 mt-1">Remote</div>
        </div>
        <div className="rounded-lg bg-bg border border-border-c p-3 text-center">
          <div className="font-serif text-3xl font-medium text-muted">{off}</div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted/70 mt-1">OOO</div>
        </div>
      </div>
      {/* Avatars */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {inOffice.slice(0, 6).map((e) => {
          const u = MOCK_USERS.find((u) => u.id === e.userId);
          if (!u) return null;
          return (
            <div
              key={u.id}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-surface"
              style={{ background: u.avatarGradient }}
              title={`${u.firstName} — In office`}
            >
              {u.initials}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Dashboard Page ───
export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  const myRank = MOCK_LEADERBOARD.find((e) => e.userId === user.id);
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-[42px] font-normal tracking-tight text-text leading-none">
          {getGreeting()}, <em className="text-accent-primary">{user.firstName}</em>
        </h1>
        <p className="mt-2 text-[13px] text-muted">{todayStr}</p>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard
          label="Hours this week"
          value="34h"
          sub="Of 40h target"
          accentColor="var(--accent-blue)"
          icon={Clock}
        />
        <StatCard
          label="Next shift"
          value="Tomorrow"
          sub="In office · 9am–5pm"
          accentColor="var(--accent-green)"
          icon={Calendar}
        />
        <StatCard
          label="Leaderboard"
          value={`#${myRank?.rank || "—"}`}
          sub={`${myRank?.totalPoints || 0} points`}
          accentColor="var(--accent-amber)"
          icon={Trophy}
        />
        <StatCard
          label="Challenges"
          value="2/5"
          sub="2 completed this week"
          accentColor="var(--accent-purple)"
          icon={Zap}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          <WeekStrip />
          <LeaderboardPreview />
          <HolidaysPreview />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <TeamTodayWidget />
          <ChallengesPreview />
          <AnnouncementsPreview />
        </div>
      </div>
    </div>
  );
}
