"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { DEPT_CONFIG, STATUS_CONFIG, type Department, type AttendanceStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Search, LayoutGrid, List, X, UserPlus } from "lucide-react";
import AddEmployeeModal from "./AddEmployeeModal";

const STATUSES: Record<string, AttendanceStatus> = {
  usr_1: "in", usr_2: "remote", usr_3: "in", usr_4: "remote",
  usr_5: "in", usr_6: "out", usr_7: "in", usr_8: "remote",
};

export default function TeamPage() {
  const { token, isAdmin, user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<Department | "ALL">("ALL");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetch("${process.env.NEXT_PUBLIC_API_URL}/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [token]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const skillsStr = u.skills?.join(" ") || "";
      const matchSearch = search === "" || `${u.firstName} ${u.lastName} ${u.jobTitle} ${skillsStr}`.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === "ALL" || u.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [search, deptFilter, users]);

  const selected = selectedMember ? users.find((u) => u.id === selectedMember) : null;
  const selectedStatus = selected ? STATUSES[selected.id] || "out" : "out";

  const handleDeleteEmployee = async (id: string) => {
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
        setSelectedMember(null);
        setDeleteConfirm(false);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[42px] font-normal tracking-tight text-text leading-none">
            Meet the <em className="text-accent-blue">Team</em>
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {users.length} people · {new Set(users.map((u) => u.department)).size} departments
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddEmployee(true)}
            className="px-4 py-2 bg-accent-blue text-white rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-2 hover:bg-[#2A5ED4] transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4" /> Add Employee
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search name, role, skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[260px] rounded-lg border border-border-c bg-surface py-2 pl-9 pr-3 text-[13px] outline-none transition-colors focus:border-accent-blue"
          />
        </div>
        <div className="flex gap-1">
          {(["ALL", "DESIGN", "STRATEGY", "VIDEO", "OPS"] as const).map((dept) => (
            <button
              key={dept}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                deptFilter === dept
                  ? "bg-accent-blue text-white border-accent-blue"
                  : "bg-surface text-muted border-border-c hover:border-accent-blue hover:text-accent-blue"
              )}
              onClick={() => setDeptFilter(dept)}
            >
              {dept === "ALL" ? "All" : DEPT_CONFIG[dept].label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex rounded-lg border border-border-c bg-surface p-0.5">
          <button
            className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              view === "grid" ? "bg-accent-blue text-white" : "text-muted")}
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              view === "list" ? "bg-accent-blue text-white" : "text-muted")}
            onClick={() => setView("list")}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-5 flex items-center gap-5 text-[11px] text-muted">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: config.color }} />
            {config.label}
          </div>
        ))}
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {filtered.map((u, i) => {
            const status = (STATUSES[u.id] || "out") as AttendanceStatus;
            const statusConfig = STATUS_CONFIG[status];
            const deptConfig = DEPT_CONFIG[u.department as Department];

            return (
              <div
                key={u.id}
                className={cn("animate-fade-up cursor-pointer overflow-hidden rounded-[var(--radius)] border border-border-c bg-surface transition-all hover:border-[#C8C0B0] hover:shadow-md hover:-translate-y-0.5")}
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => setSelectedMember(u.id)}
              >
                <div className="h-1 rounded-t-[var(--radius)]" style={{ background: u.avatarGradient }} />
                <div className="flex gap-3.5 p-5 pb-3">
                  <div className="relative">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white"
                      style={{ background: u.avatarGradient }}
                    >
                      {u.initials}
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface"
                      style={{ background: statusConfig.color }}
                    />
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold">{u.firstName} {u.lastName}</div>
                    <div className="text-xs text-muted">{u.jobTitle}</div>
                    <span
                      className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                      style={{ background: deptConfig.bg, color: deptConfig.color, border: `1px solid ${deptConfig.borderColor}` }}
                    >
                      {deptConfig.label}
                    </span>
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <p className="mb-3 text-[13px] leading-relaxed text-muted line-clamp-2">{u.bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(u.skills || []).map((s: string) => (
                      <span key={s} className="rounded-md bg-bg border border-border-c px-2 py-0.5 text-[11px] font-medium text-muted">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border-c px-5 py-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted">
                    <div className="h-2 w-2 rounded-full" style={{ background: statusConfig.color }} />
                    {statusConfig.label}{status !== "out" ? " today" : ""}
                  </div>
                  <div className="flex gap-1.5">
                    {u.socialLinks?.linkedin && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-md border border-border-c text-[10px] font-bold text-muted hover:border-accent-blue hover:text-accent-blue transition-colors cursor-pointer">in</div>
                    )}
                    {u.socialLinks?.behance && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-md border border-border-c text-[10px] font-bold text-muted hover:border-accent-blue hover:text-accent-blue transition-colors cursor-pointer">Be</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="rounded-[var(--radius)] border border-border-c bg-surface overflow-hidden">
          {filtered.map((u) => {
            const status = (STATUSES[u.id] || "out") as AttendanceStatus;
            const statusConfig = STATUS_CONFIG[status];
            const deptConfig = DEPT_CONFIG[u.department as Department];
            return (
              <div
                key={u.id}
                className="flex items-center gap-3.5 border-b border-border-c px-5 py-3 cursor-pointer hover:bg-bg transition-colors"
                onClick={() => setSelectedMember(u.id)}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: u.avatarGradient }}>
                  {u.initials}
                </div>
                <div className="w-[150px] shrink-0">
                  <div className="text-sm font-semibold">{u.firstName} {u.lastName}</div>
                  <div className="text-[11px] text-muted">{u.jobTitle}</div>
                </div>
                <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ background: deptConfig.bg, color: deptConfig.color, border: `1px solid ${deptConfig.borderColor}` }}>
                  {deptConfig.label}
                </span>
                <div className="flex flex-1 flex-wrap gap-1">
                  {(u.skills || []).slice(0, 3).map((s: string) => (
                    <span key={s} className="rounded-md bg-bg border border-border-c px-2 py-0.5 text-[11px] text-muted">{s}</span>
                  ))}
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted">
                  <div className="h-2 w-2 rounded-full" style={{ background: statusConfig.color }} />
                  {statusConfig.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 z-[200] bg-text/40 backdrop-blur-sm" onClick={() => { setSelectedMember(null); setDeleteConfirm(false); }} />
          <div className="fixed top-0 right-0 z-[201] h-screen w-[500px] animate-slide-in-right overflow-y-auto border-l border-border-c bg-surface shadow-xl flex flex-col">
            <button
              onClick={() => { setSelectedMember(null); setDeleteConfirm(false); }}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-border-c bg-surface text-muted hover:border-accent-blue hover:text-accent-blue transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>
            {/* Hero */}
            <div className="border-b border-border-c px-8 py-9">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold text-white"
                  style={{ background: selected.avatarGradient }}
                >
                  {selected.initials}
                </div>
                <div>
                  <div className="font-display text-[26px] font-light leading-none">{selected.firstName} {selected.lastName}</div>
                  <div className="mt-1 text-[13px] text-muted">{selected.jobTitle} · {DEPT_CONFIG[selected.department as Department]?.label}</div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: STATUS_CONFIG[selectedStatus as AttendanceStatus]?.color }}>
                    <div className="h-[7px] w-[7px] rounded-full" style={{ background: STATUS_CONFIG[selectedStatus as AttendanceStatus]?.color }} />
                    {STATUS_CONFIG[selectedStatus as AttendanceStatus]?.label}
                    {selected.funFact && <span className="text-muted"> · {selected.funFact}</span>}
                  </div>
                </div>
              </div>
            </div>
            {/* Body */}
            <div className="px-8 py-6">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted mb-2.5">About</div>
              <p className="text-[13px] leading-[1.75]">{selected.bio}</p>

              <div className="mt-5 text-[11px] font-medium uppercase tracking-wider text-muted mb-2.5">This week</div>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-lg bg-blue-bg border border-blue-border p-3.5 text-center">
                  <div className="font-display text-xl font-semibold text-blue-text">34h</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted">Logged</div>
                </div>
                <div className="rounded-lg bg-green-bg border border-green-border p-3.5 text-center">
                  <div className="font-display text-xl font-semibold text-green-text">92%</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted">Utilization</div>
                </div>
                <div className="rounded-lg bg-amber-bg border border-amber-border p-3.5 text-center">
                  <div className="font-display text-xl font-semibold text-amber-text">5</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted">Clients</div>
                </div>
              </div>

              <div className="mt-5 text-[11px] font-medium uppercase tracking-wider text-muted mb-2.5">Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {(selected.skills || []).map((s: string) => (
                  <span key={s} className="rounded-md bg-bg border border-border-c px-2.5 py-1 text-xs font-medium text-muted">{s}</span>
                ))}
              </div>

              <div className="mt-auto pt-8 flex flex-col gap-2.5">
                <div className="flex gap-2.5">
                  <button className="flex-1 rounded-lg bg-accent-blue px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#2A5ED4] transition-colors">
                    Message {selected.firstName}
                  </button>
                  <button className="rounded-lg border border-border-c bg-surface px-4 py-2.5 text-[13px] font-medium text-text hover:border-accent-blue hover:text-accent-blue transition-colors">
                    View schedule
                  </button>
                </div>
                {isAdmin && selected.id !== user?.id && (
                  <>
                    {deleteConfirm ? (
                      <div className="rounded-lg border border-coral-border bg-coral-bg p-4 mt-2">
                        <div className="text-[13px] font-bold text-coral-text mb-1">Confirm Deletion</div>
                        <div className="text-[11px] text-coral-text/80 mb-3">This action cannot be undone and will delete all associated records.</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDeleteConfirm(false)}
                            className="flex-1 rounded-md border border-coral-border px-3 py-2 text-[11px] font-bold text-coral-text hover:bg-surface transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(selected.id)}
                            className="flex-1 rounded-md bg-accent-coral px-3 py-2 text-[11px] font-bold text-white hover:brightness-110 transition-colors"
                          >
                            {loading ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(true)}
                        className="w-full rounded-lg border border-coral-border text-coral-text py-2.5 text-[13px] font-medium hover:bg-coral-bg transition-colors mt-2"
                      >
                        Delete Employee
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showAddEmployee && (
        <AddEmployeeModal
          onClose={() => setShowAddEmployee(false)}
          onAdded={(u) => setUsers([...users, u])}
        />
      )}
    </div>
  );
}
