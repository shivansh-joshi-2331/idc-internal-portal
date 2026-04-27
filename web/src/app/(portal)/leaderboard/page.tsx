"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { MOCK_LEADERBOARD, MOCK_CHALLENGES, MOCK_ACHIEVEMENTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const MEDALS = ["🥇", "🥈", "🥉"];
const MEDAL_COLORS = ["var(--accent-amber)", "var(--silver)", "var(--bronze)"];

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");
  const myEntry = MOCK_LEADERBOARD.find((e) => e.userId === user?.id);
  const leader = MOCK_LEADERBOARD[0];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-[42px] font-normal tracking-tight text-text leading-none">
          Team <em className="text-accent-amber">Leaderboard</em>
        </h1>
        <p className="mt-1 text-[13px] text-muted">Weekly points · Friday Games · Challenges · Streak tracking</p>
      </div>

      {/* Period tabs */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex rounded-lg border border-border-c bg-surface p-0.5">
          {(["week", "month", "all"] as const).map((p) => (
            <button
              key={p}
              className={cn("rounded-md px-4 py-1.5 text-xs font-medium transition-all",
                period === p ? "bg-accent-amber text-white" : "text-muted hover:text-text"
              )}
              onClick={() => setPeriod(p)}
            >
              {p === "week" ? "This week" : p === "month" ? "This month" : "All time"}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-accent-amber px-4 py-2 text-[13px] font-medium text-white hover:bg-[#D49000] transition-colors">
          🎯 Submit entry
        </button>
      </div>

      {/* My Rank Banner */}
      {myEntry && (
        <div className="animate-fade-up mb-6 flex items-center gap-5 rounded-[var(--radius)] border border-blue-border bg-blue-bg p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white" style={{ background: user?.avatarGradient }}>
            {user?.initials}
          </div>
          <div>
            <div className="text-xs font-medium text-blue-text">Your rank this week</div>
            <div className="flex items-baseline gap-2.5">
              <span className="font-serif text-[48px] font-medium text-accent-primary tracking-tight leading-none">#{myEntry.rank}</span>
              <div>
                <div className="font-display text-xl text-blue-text">{myEntry.totalPoints} pts</div>
                <div className="text-[11px] text-blue-text/70">↑ +{myEntry.weeklyDelta} since Monday</div>
              </div>
            </div>
          </div>
          <div className="flex-1 max-w-[300px] ml-auto">
            <div className="mb-1 h-2 rounded-full bg-accent-blue/15 overflow-hidden">
              <div className="h-full rounded-full bg-accent-blue transition-all" style={{ width: `${(myEntry.totalPoints / leader.totalPoints) * 100}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-blue-text">
              <span>You · {myEntry.totalPoints}</span>
              <span>Leader · {leader.totalPoints}</span>
            </div>
          </div>
          <div className="text-right ml-auto">
            <div className="text-[11px] font-medium text-blue-text">{leader.totalPoints - myEntry.totalPoints} pts to #1</div>
          </div>
        </div>
      )}

      {/* Podium */}
      <div className="animate-fade-up mb-6 grid grid-cols-3 gap-4 items-end">
        {[MOCK_LEADERBOARD[1], MOCK_LEADERBOARD[0], MOCK_LEADERBOARD[2]].map((entry, i) => {
          const rank = [2, 1, 3][i];
          const isGold = rank === 1;
          return (
            <div
              key={entry.userId}
              className={cn(
                "relative overflow-hidden rounded-[var(--radius)] border p-5 text-center transition-all hover:-translate-y-1 hover:shadow-lg",
                isGold ? "bg-amber-bg border-amber-border" : "bg-surface border-border-c",
                isGold && "pb-8"
              )}
            >
              <div className="absolute left-3.5 top-3 text-lg">{MEDALS[rank - 1]}</div>
              <div className={cn(
                "mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-full text-lg font-bold text-white",
                rank === 1 && "shadow-lg shadow-amber-500/30"
              )} style={{
                background: rank === 1 ? "linear-gradient(135deg, #F0A500, #F8D060)" :
                  rank === 2 ? "linear-gradient(135deg, #8A9099, #BFC5CC)" :
                    "linear-gradient(135deg, #A05820, #D09060)"
              }}>
                {entry.user.initials}
              </div>
              <div className="text-[15px] font-semibold">{entry.user.firstName} {entry.user.lastName}</div>
              <div className="text-[11px] text-muted mb-3">{entry.user.jobTitle}</div>
              <div className="font-display text-3xl font-semibold tracking-tight" style={{ color: MEDAL_COLORS[rank - 1] }}>
                {entry.totalPoints}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted mt-0.5">points</div>
              <div className="mt-2 flex justify-center gap-1 text-base">{entry.badges.join("")}</div>
              <div className="mt-1.5 text-[11px] font-medium text-accent-green">↑ {entry.weeklyDelta} this week</div>
            </div>
          );
        })}
      </div>

      {/* Full Rankings Table */}
      <div className="animate-fade-up mb-6 overflow-hidden rounded-[var(--radius)] border border-border-c bg-surface">
        <div className="flex items-center gap-3 border-b border-border-c bg-bg px-5 py-2.5 text-[10px] uppercase tracking-wider text-muted font-medium">
          <div className="w-7">#</div>
          <div className="w-9"></div>
          <div className="flex-1">Member</div>
          <div className="w-20">Badges</div>
          <div className="w-14 text-right">Pts</div>
          <div className="w-11 text-right">Week</div>
          <div className="w-24"></div>
        </div>
        {MOCK_LEADERBOARD.map((entry, i) => {
          const isMe = entry.userId === user?.id;
          return (
            <div
              key={entry.userId}
              className={cn(
                "flex items-center gap-3 border-b border-border-c px-5 py-3 transition-colors cursor-pointer",
                isMe ? "bg-blue-bg border-l-[3px] border-l-accent-blue pl-[17px]" : "hover:bg-bg"
              )}
            >
              <div className="w-7 text-center text-sm font-semibold text-muted">
                {i < 3 ? <span className="text-base">{MEDALS[i]}</span> : entry.rank}
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: entry.user.avatarGradient }}>
                {entry.user.initials}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{entry.user.firstName} {entry.user.lastName}</div>
                <div className="text-[11px] text-muted">{entry.user.jobTitle}</div>
              </div>
              <div className="w-20 text-base">{entry.badges.join("")}</div>
              <div className="w-14 text-right font-display text-lg font-semibold tracking-tight"
                style={{ color: i < 3 ? MEDAL_COLORS[i] : undefined }}>
                {entry.totalPoints}
              </div>
              <div className={cn("w-11 text-right text-[11px] font-medium",
                entry.weeklyDelta >= 0 ? "text-accent-green" : "text-accent-coral")}>
                {entry.weeklyDelta >= 0 ? "+" : ""}{entry.weeklyDelta}
              </div>
              <div className="w-24">
                <div className="h-[5px] rounded-full bg-border-c overflow-hidden">
                  <div className="h-full rounded-full bg-accent-blue transition-all"
                    style={{ width: `${(entry.totalPoints / leader.totalPoints) * 100}%`, background: i < 3 ? MEDAL_COLORS[i] : undefined }} />
                </div>
              </div>
              {isMe && <span className="rounded bg-accent-blue/10 px-2 py-0.5 text-[10px] font-semibold text-accent-blue">You</span>}
            </div>
          );
        })}
      </div>

      {/* Challenges + Achievements */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Challenges */}
        <div className="rounded-[var(--radius)] border border-border-c bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold">This week&apos;s challenges</div>
              <div className="text-[11px] text-muted">Ends Friday 6pm · {MOCK_CHALLENGES.filter((c) => c.completed).length} of {MOCK_CHALLENGES.length} complete</div>
            </div>
            <span className="text-xl">🎯</span>
          </div>
          {MOCK_CHALLENGES.map((ch) => (
            <div key={ch.id} className="flex items-center gap-3 border-b border-border-c py-2.5 last:border-0">
              <div className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                ch.completed ? "bg-green-bg border border-green-border text-green-text" : "bg-bg border border-border-c text-muted")}>
                {ch.completed ? "✓" : "○"}
              </div>
              <div className="rounded-md p-1.5 text-[13px]" style={{ background: ch.completed ? "var(--green-bg)" : "var(--bg)" }}>{ch.icon}</div>
              <div className="flex-1 text-[13px] font-medium">{ch.title}</div>
              <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold border",
                ch.completed ? "bg-green-bg border-green-border text-green-text" : "bg-bg border-border-c text-muted")}>
                +{ch.points} pts
              </span>
            </div>
          ))}
        </div>

        {/* Friday Games */}
        <div className="rounded-[var(--radius)] border border-border-c bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold">Friday Games — Week 13</div>
              <div className="text-[11px] text-muted">Design Roast · Voting closes Fri 5pm</div>
            </div>
            <span className="text-xl">🎮</span>
          </div>
          {[
            { rank: 1, name: "Roger's \"brutalist email client\"", votes: 24, leading: true },
            { rank: 2, name: "Sofia's \"pastel chaos dashboard\"", votes: 19, leading: false },
            { rank: 3, name: "Jamie's \"skeuomorphic app store\"", votes: 14, leading: false },
            { rank: 4, name: "Marcus's \"corporate clipart revival\"", votes: 8, leading: false },
          ].map((g) => (
            <div key={g.rank} className="flex items-center gap-3 border-b border-border-c py-2.5 last:border-0">
              <div className="font-display text-lg font-semibold w-7 text-center" style={{
                color: g.rank === 1 ? "var(--amber-text)" : g.rank === 2 ? "var(--silver)" : g.rank === 3 ? "var(--bronze)" : "var(--muted)"
              }}>{g.rank}</div>
              <div className="flex-1 text-[13px] font-medium">{g.name}</div>
              <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold border",
                g.leading ? "bg-amber-bg border-amber-border text-amber-text" : "bg-blue-bg border-blue-border text-blue-text")}>
                {g.votes} votes
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-2 flex items-center gap-4">
        <h2 className="font-display text-xl font-light italic whitespace-nowrap">Achievements & badges</h2>
        <div className="h-px flex-1 bg-border-c" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {MOCK_ACHIEVEMENTS.map((ach) => (
          <div key={ach.id} className={cn(
            "relative overflow-hidden rounded-lg border border-border-c bg-surface p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md",
            ach.unlocked ? "border-accent-amber" : "opacity-45"
          )}>
            {ach.unlocked && <span className="absolute right-2.5 top-2 text-[10px] font-bold text-accent-amber">✓</span>}
            <span className="mb-2 block text-3xl">{ach.icon}</span>
            <div className="text-xs font-semibold mb-0.5">{ach.name}</div>
            <div className="text-[10px] text-muted leading-snug">{ach.description}</div>
            <div className="mt-1.5 inline-block rounded bg-amber-bg px-2 py-0.5 text-[10px] font-semibold text-amber-text">+{ach.points} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
}
