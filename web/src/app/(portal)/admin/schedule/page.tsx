"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, CheckCircle2, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function AdminSchedulePage() {
  const [selectedUser, setSelectedUser] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [shiftType, setShiftType] = useState("IN_OFFICE");
  const { token } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);

  // Fetch true users from API on mount
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:4000/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
         if(Array.isArray(data)) setUsers(data);
      })
      .catch(console.error);
      
    fetchPendingLeaves();
  }, [token]);

  const fetchPendingLeaves = () => {
    fetch("http://localhost:4000/api/schedule/leave/pending", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
         if(Array.isArray(data)) setPendingLeaves(data);
      })
      .catch(console.error);
  };

  const handleLeaveAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`http://localhost:4000/api/schedule/leave/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchPendingLeaves();
    } catch (error) {
      console.error(error);
      alert("Error updating leave request");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/schedule/entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser,
          date: targetDate,
          type: shiftType,
        }),
      });

      if (!res.ok) throw new Error("Failed to update schedule");
      alert("Schedule updated successfully!");
    } catch (err) {
      alert("Error updating schedule: " + err);
    }
  };

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-5xl text-text tracking-tight mb-2">
          Manage Schedule
        </h1>
        <p className="text-sm text-muted">
          Override defaults, set holidays, or configure bulk schedule blocks.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Left Column: Editor */}
        <div className="col-span-1 border border-border-c rounded-[var(--radius)] bg-surface p-6 self-start shadow-sm">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-muted mb-5">
            Single Entry Editor
          </h2>
          
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5 block">
                Employee
              </label>
              <select
                required
                className="w-full rounded-md border border-border-c bg-bg px-3 py-2 text-[13px] outline-none focus:border-accent-primary"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select teammate...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.jobTitle})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5 block">
                Target Date
              </label>
              <input
                type="date"
                required
                className="w-full rounded-md border border-border-c bg-bg px-3 py-2 text-[13px] outline-none focus:border-accent-primary"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5 block">
                Shift Type
              </label>
              <select
                className="w-full rounded-md border border-border-c bg-bg px-3 py-2 text-[13px] outline-none focus:border-accent-primary"
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value)}
              >
                <option value="IN_OFFICE">In Office</option>
                <option value="REMOTE">Remote</option>
                <option value="DAY_OFF">Day Off</option>
                <option value="GAMES_DAY">Games Day</option>
                <option value="HOLIDAY">Holiday</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-accent-primary py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Update Record
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Pending Approvals / Notifs placeholder */}
        <div className="col-span-2">
          <div className="border border-border-c rounded-[var(--radius)] bg-surface shadow-sm overflow-hidden mb-6">
            <div className="border-b border-border-c bg-bg px-5 py-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Pending Leave Requests
              </h3>
            </div>
            <div className="divide-y divide-border-c max-h-[300px] overflow-y-auto">
              {pendingLeaves.length === 0 ? (
                <div className="p-10 text-center text-[13px] text-muted">
                  No leave requests require immediate approval.
                </div>
              ) : (
                pendingLeaves.map(leave => (
                  <div key={leave.id} className="p-4 flex items-center justify-between hover:bg-bg/50 transition-colors">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-sm" style={{ background: leave.user?.avatarGradient || "var(--accent-primary)" }}>
                        {leave.user?.initials}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-text mb-0.5">
                          {leave.user?.firstName} {leave.user?.lastName} requested leave
                        </div>
                        <div className="text-[11px] text-muted mb-1">
                          {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                        {leave.reason && <div className="text-[11px] italic text-muted max-w-[250px] truncate">"{leave.reason}"</div>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleLeaveAction(leave.id, "REJECTED")}
                        className="px-3 py-1.5 rounded-md border border-border-c text-[11px] font-bold uppercase tracking-wider text-muted hover:bg-bg hover:text-text transition-colors"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleLeaveAction(leave.id, "APPROVED")}
                        className="px-3 py-1.5 rounded-md bg-accent-primary text-white text-[11px] font-bold uppercase tracking-wider hover:brightness-110 transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="border border-border-c rounded-[var(--radius)] bg-surface shadow-sm overflow-hidden">
            <div className="border-b border-border-c bg-bg px-5 py-3 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
                Recent Overrides Log
              </h3>
              <button className="text-[11px] font-medium text-accent-primary hover:underline">
                View All
              </button>
            </div>
            
            <div className="divide-y divide-border-c">
              {[1, 2].map((i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-4 hover:bg-bg/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center font-serif text-lg">
                    JL
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-text">Set generic shift config for entire org.</p>
                    <p className="text-[11px] text-muted">By Admin • 2h ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
