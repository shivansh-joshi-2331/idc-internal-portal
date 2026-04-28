"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/store";
import { SHIFT_CONFIG } from "@/lib/types";
import { cn, getDaysInMonth, getFirstDayOfMonth, isWeekend, isToday, formatTime } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Filter, Trash2, X, PlusCircle, CheckCircle2 } from "lucide-react";
import { startOfWeek, addDays, format } from "date-fns";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SchedulePage() {
  const { user, token } = useAuthStore();
  const now = new Date();

  // High-level UI State
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [viewMode, setViewMode] = useState<"my" | "team">("my");
  const [calendarView, setCalendarView] = useState<"month" | "week">("month");

  // Weekly View State
  const [weekStartDate, setWeekStartDate] = useState(() => startOfWeek(now));

  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [scheduleEntries, setScheduleEntries] = useState<any[]>([]);
  const [monthTasks, setMonthTasks] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Leave Request logic
  const [isRequestingLeave, setIsRequestingLeave] = useState(false);
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [leaveReason, setLeaveReason] = useState("");

  // Toggl / Time Tracker State
  const [activeDay, setActiveDay] = useState<string | null>(null); // YYYY-MM-DD
  const [selectedDayEntries, setSelectedDayEntries] = useState<any[]>([]);
  const [activeTeamFilter, setActiveTeamFilter] = useState<string | null>(null);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // New Click-to-select tracking
  const [clickStart, setClickStart] = useState<number | null>(null); // Hover anchor
  const [dragCurrent, setDragCurrent] = useState<number | null>(null); // Current hover
  const [dragFinalStart, setDragFinalStart] = useState<number | null>(null); // Locked anchor
  const [dragFinalEnd, setDragFinalEnd] = useState<number | null>(null); // Locked end

  const timelineRef = useRef<HTMLDivElement>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Fetch Schedule Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule?year=${year}&month=${month + 1}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setScheduleEntries(data);

      const uRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsersList(await uRes.json());

      const tRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/time?year=${year}&month=${month + 1}&viewMode=${viewMode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMonthTasks(await tRes.json());

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [year, month, token, viewMode]);

  // Fetch Tracker entries for active day (either My or Team depending on viewMode)
  useEffect(() => {
    if (activeDay) {
      setSelectedDayEntries([]);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/time?date=${activeDay}&viewMode=${viewMode}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          // Because API returns ALL entries for this day if admin, we filter based on viewMode
          if (viewMode === "my") {
            setSelectedDayEntries(data.filter((e: any) => e.userId === user?.id));
          } else {
            setSelectedDayEntries(data);
          }
        })
        .catch(console.error);
    }
  }, [activeDay, token, viewMode, user?.id]);

  const prevRange = () => {
    if (calendarView === "month") {
      if (month === 0) { setYear(year - 1); setMonth(11); }
      else setMonth(month - 1);
    } else {
      setWeekStartDate(addDays(weekStartDate, -7));
    }
  };
  const nextRange = () => {
    if (calendarView === "month") {
      if (month === 11) { setYear(year + 1); setMonth(0); }
      else setMonth(month + 1);
    } else {
      setWeekStartDate(addDays(weekStartDate, 7));
    }
  };

  const visibleEntries = useMemo(() => {
    if (viewMode === "my") return scheduleEntries.filter(s => s.userId === user?.id);
    if (selectedMember) return scheduleEntries.filter(s => s.userId === selectedMember);
    return scheduleEntries;
  }, [scheduleEntries, viewMode, selectedMember, user?.id]);

  // Generate Month Matrix
  const calendarCells = useMemo(() => {
    const cells: { day: number; date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];
    for (let i = 0; i < firstDay; i++) {
      const d = new Date(year, month, -(firstDay - 1 - i));
      cells.push({ day: d.getDate(), date: d, dateStr: "", isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, date: new Date(year, month, d), dateStr, isCurrentMonth: true });
    }
    return cells;
  }, [year, month, daysInMonth, firstDay]);

  // Generate Week Matrix
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStartDate, i);
      days.push({
        date: d,
        dateStr: format(d, "yyyy-MM-dd"),
        label: format(d, "EEE"),
        day: format(d, "d")
      });
    }
    return days;
  }, [weekStartDate]);

  function getChipsForDate(dateStr: string) {
    if (!dateStr) return [];
    const entries = visibleEntries.filter((e) => e.date.startsWith(dateStr));
    const chips: any[] = [];

    if (viewMode === "my" || selectedMember) {
      entries.forEach((e) => {
        chips.push({ isGroup: false, type: e.type, config: SHIFT_CONFIG[e.type as keyof typeof SHIFT_CONFIG] });
      });
    } else {
      const grouped: Record<string, any[]> = {};
      entries.forEach((e) => {
        const typeStr = e.type;
        if (!grouped[typeStr]) grouped[typeStr] = [];
        const userObj = usersList.find(u => u.id === e.userId) || e.user;
        if (userObj) grouped[typeStr].push(userObj);
      });
      Object.entries(grouped).forEach(([typeStr, people]) => {
        const config = SHIFT_CONFIG[typeStr as keyof typeof SHIFT_CONFIG];
        if (config) {
          chips.push({ isGroup: true, type: typeStr, config, users: people });
        }
      });
    }
    return chips;
  }

  // --- INTERACTION HELPER (Two-Click Inline) ---
  const getTimeFromEvent = (e: React.MouseEvent) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hour = y / 60; // 1 hr = 60px
    return Math.max(0, Math.min(24, Math.round(hour * 4) / 4)); // Snap to 15m
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (isAddingTask) return; // Wait until current block is resolved
    const time = getTimeFromEvent(e);

    if (clickStart === null) {
      // First click: Drop anchor
      setClickStart(time);
      setDragCurrent(time + 1); // Default hover span
    } else {
      // Second click: Lock block and show inline input
      const start = Math.min(clickStart, time);
      let end = Math.max(clickStart, time);
      if (start === end) end = start + 1; // Prevent 0-min blocks

      setDragFinalStart(start);
      setDragFinalEnd(end);
      setClickStart(null);
      setDragCurrent(null);
      setIsAddingTask(true);
    }
  };

  const handleTimelineMouseMove = (e: React.MouseEvent) => {
    if (clickStart !== null && !isAddingTask) {
      setDragCurrent(getTimeFromEvent(e));
    }
  };

  const cancelAdding = () => {
    setIsAddingTask(false);
    setClickStart(null);
    setDragCurrent(null);
    setDragFinalStart(null);
    setDragFinalEnd(null);
    setNewTaskTitle("");
  }

  const saveTask = async () => {
    if (!newTaskTitle || !activeDay || dragFinalStart === null || dragFinalEnd === null) return;

    const startTime = new Date(activeDay);
    startTime.setHours(Math.floor(dragFinalStart), (dragFinalStart % 1) * 60, 0, 0);
    const endTime = new Date(activeDay);
    endTime.setHours(Math.floor(dragFinalEnd), (dragFinalEnd % 1) * 60, 0, 0);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/time`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ taskName: newTaskTitle, startTime, endTime })
      });
      if (res.ok) {
        const saved = await res.json();
        setSelectedDayEntries([...selectedDayEntries, saved]);
        cancelAdding();
      }
    } catch (err) { console.error(err); }
  };

  const deleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/time/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedDayEntries(selectedDayEntries.filter(t => t.id !== id));
    } catch (err) { console.error(err); }
  };

  const submitLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ startDate: leaveStart, endDate: leaveEnd, reason: leaveReason })
      });
      if (res.ok) {
        alert("Leave request submitted successfully!");
        setIsRequestingLeave(false);
        setLeaveStart(""); setLeaveEnd(""); setLeaveReason("");
      } else {
        alert("Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // --- AVATAR EXTRACTOR FOR TEAM VIEW ---
  // Get distinct users who have tasks today
  const activeSiderUsers = useMemo(() => {
    if (viewMode !== 'team') return [];
    const distinctIdMap = new Map();
    selectedDayEntries.forEach(entry => {
      if (!distinctIdMap.has(entry.userId)) {
        const u = usersList.find(x => x.id === entry.userId) || entry.user;
        distinctIdMap.set(entry.userId, u);
      }
    });
    return Array.from(distinctIdMap.values());
  }, [selectedDayEntries, viewMode, usersList]);

  // Render Time Block helper (For active day Timeline log sidebar)
  const renderTimeBlock = (entry: any) => {
    const start = new Date(entry.startTime);
    const end = new Date(entry.endTime || new Date());
    const top = (start.getHours() + start.getMinutes() / 60) * 60;
    const height = ((end.getTime() - start.getTime()) / 60000); // 1m = 1px

    const userObj = usersList.find(u => u.id === entry.userId) || entry.user;
    const gradient = userObj?.avatarGradient || "linear-gradient(135deg, #3B6FE8, #7C5CBF)";
    const initials = userObj?.initials || "??";

    // Dim if filtering
    const isMuted = activeTeamFilter && activeTeamFilter !== entry.userId;

    return (
      <div
        key={entry.id}
        className={cn(
          "absolute inset-x-0 mx-2 rounded-md border-l-4 shadow-sm group hover:brightness-95 transition-all overflow-hidden flex flex-col justify-between",
          isMuted ? "opacity-20 pointer-events-none" : "opacity-100"
        )}
        style={{
          top: `${top}px`,
          height: `${Math.max(height, 30)}px`,
          background: "var(--bg)",
          borderColor: "transparent",
          backgroundImage: `linear-gradient(var(--bg), var(--bg)), ${gradient}`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box'
        }}
      >
        <div className="flex items-start justify-between p-2 pb-1 bg-surface/50 h-full">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              {viewMode === "team" && (
                <span className="flex-shrink-0 w-3 h-3 rounded-full text-[6px] flex items-center justify-center text-white" style={{ background: gradient }}>{initials}</span>
              )}
              <p className="text-xs font-bold leading-none truncate w-full text-text">{entry.taskName}</p>
            </div>
            <p className="text-[9px] text-muted font-medium">
              {formatTime(start.getHours() + ":" + start.getMinutes())} - {formatTime(end.getHours() + ":" + end.getMinutes())}
            </p>
          </div>
          {viewMode === "my" && (
            <button onClick={(e) => deleteTask(entry.id, e)} className="opacity-0 group-hover:opacity-100 p-0 text-coral-text transition-all"><Trash2 className="h-3 w-3" /></button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 overflow-hidden relative">

      {/* ─── LEFT: MULTI-PURPOSE CALENDAR GRID (Month / Week) ─────────────── */}
      <div className={cn("flex flex-col transition-all duration-300", activeDay ? "w-1/2 flex-[2]" : "w-full")}>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-[42px] font-normal tracking-tight leading-none">
              Team <em className="text-accent-primary">Schedule</em>
            </h1>
            <p className="mt-2 text-[13px] text-muted">
              {calendarView === "month" ? `${MONTH_NAMES[month]} ${year}` : `Week of ${format(weekStartDate, "MMM d, yyyy")}`} · Viewing {viewMode === "my" ? "Personal" : "Team"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Apply for Leave Button */}
            {user?.role !== "ADMIN" && (
              <button
                onClick={() => setIsRequestingLeave(true)}
                className="px-4 py-2 border border-border-c rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-2 hover:bg-bg transition-colors shadow-sm"
              >
                <PlusCircle className="h-3.5 w-3.5 text-accent-primary" /> Apply for Leave
              </button>
            )}

            {/* Month/Week Switch Dropdown */}
            <select
              value={calendarView}
              onChange={(e) => setCalendarView(e.target.value as "month" | "week")}
              className="rounded-lg border border-border-c bg-surface px-3 py-1.5 text-xs font-medium text-text shadow-sm outline-none w-28"
            >
              <option value="month">Month View</option>
              <option value="week">Week View</option>
            </select>

            {/* My/Team Switch */}
            <div className="flex rounded-lg border border-border-c bg-surface p-1 shadow-sm">
              <button onClick={() => setViewMode("my")} className={cn("px-4 py-1.5 text-xs font-medium rounded-md transition-all", viewMode === "my" ? "bg-accent-primary text-white" : "text-muted hover:text-text")}>Personal</button>
              <button onClick={() => { setViewMode("team"); setSelectedMember(null); }} className={cn("px-4 py-1.5 text-xs font-medium rounded-md transition-all", viewMode === "team" ? "bg-accent-primary text-white" : "text-muted hover:text-text")}>Team</button>
            </div>

            {/* Global Filter (Only in Team Mode) */}
            {viewMode === "team" && (
              <select
                value={selectedMember || ""}
                onChange={(e) => setSelectedMember(e.target.value || null)}
                className="rounded-lg border border-border-c bg-surface px-3 py-1.5 text-xs font-medium text-text shadow-sm outline-none w-40"
              >
                <option value="">All Employees</option>
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col rounded-[var(--radius)] border border-border-c bg-surface shadow-sm overflow-hidden animate-fade-up">
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-border-c px-6 py-4">
            <h2 className="font-serif text-2xl font-semibold">
              {calendarView === "month" ? `${MONTH_NAMES[month]} ${year}` : `Week of ${format(weekStartDate, "MMM d")}`}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevRange} className="p-1 hover:bg-bg rounded-md border border-border-c transition-colors"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={nextRange} className="p-1 hover:bg-bg rounded-md border border-border-c transition-colors"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col relative">
            {/* MONTH VIEW GRID */}
            {calendarView === "month" && (
              <>
                <div className="grid grid-cols-7 border-b border-border-c bg-bg/50">
                  {DAY_LABELS.map(d => <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 flex-1 overflow-y-auto">
                  {calendarCells.map((cell, i) => {
                    const chips = getChipsForDate(cell.dateStr);
                    const isSelected = activeDay === cell.dateStr;
                    return (
                      <div
                        key={i}
                        onClick={() => cell.isCurrentMonth && setActiveDay(cell.dateStr)}
                        className={cn(
                          "min-h-[100px] border-b border-r border-border-c p-2 transition-colors cursor-pointer group flex flex-col",
                          !cell.isCurrentMonth && "bg-bg/20 opacity-30 pointer-events-none",
                          isSelected && "bg-blue-bg/30 ring-2 ring-inset ring-accent-primary/20",
                          cell.isCurrentMonth && !isSelected && "hover:bg-bg/50"
                        )}
                      >
                        <div className={cn("text-xs font-medium mb-1 flex items-center justify-between", isToday(cell.dateStr) ? "text-accent-primary font-bold" : "text-text")}>
                          <span>{cell.day}</span>
                        </div>
                        <div className="space-y-1 flex-1">
                          {chips.slice(0, 3).map((c, j) => (
                            <div key={j} className="flex flex-col gap-1 rounded px-1.5 py-1 border" style={{ background: c.config.bg, borderColor: c.config.borderColor }}>
                              <div className="text-[9px] font-medium" style={{ color: c.config.color }}>
                                {c.isGroup ? `${c.users.length} ${c.config.label}` : c.config.label}
                              </div>
                              {c.isGroup && (
                                <div className="flex flex-wrap gap-0.5">
                                  {c.users.slice(0, 5).map((u: any) => (
                                    <div
                                      key={u.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDay(cell.dateStr);
                                        setActiveTeamFilter(u.id);
                                      }}
                                      className="h-4 w-4 rounded-full flex items-center justify-center text-[7px] text-white font-bold cursor-pointer hover:ring-1 hover:ring-accent-primary shadow-sm"
                                      style={{ background: u.avatarGradient || "var(--accent-primary)" }}
                                      title={`${u.firstName} ${u.lastName}`}
                                    >
                                      {u.initials}
                                    </div>
                                  ))}
                                  {c.users.length > 5 && <div className="text-[8px] text-muted ml-0.5 mt-0.5">+{c.users.length - 5}</div>}
                                </div>
                              )}
                            </div>
                          ))}
                          {chips.length > 3 && <div className="text-[9px] text-muted px-1">+{chips.length - 3} more</div>}
                        </div>

                        {/* Time Tracked Indicator */}
                        {(() => {
                          const dayTasks = monthTasks.filter(t => t.startTime.startsWith(cell.dateStr));
                          if (dayTasks.length === 0) return null;

                          if (viewMode === "my") {
                            return (
                              <div className="mt-1 flex items-center gap-1 text-[9px] text-muted font-medium border-t border-border-c/50 pt-1 shrink-0">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" /> Time tracked
                              </div>
                            );
                          } else {
                            const distinctUsers = Array.from(new Set(dayTasks.map(t => t.userId))).map(id => {
                              return usersList.find(u => u.id === id) || dayTasks.find(t => t.userId === id)?.user;
                            }).filter(Boolean);

                            return (
                              <div className="mt-1 border-t border-border-c/50 pt-1 shrink-0">
                                <div className="text-[8px] font-bold text-muted uppercase tracking-wider mb-0.5">Time Logged</div>
                                <div className="flex flex-wrap gap-0.5">
                                  {distinctUsers.slice(0, 5).map((u: any) => (
                                    <div
                                      key={u.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDay(cell.dateStr);
                                        setActiveTeamFilter(u.id);
                                      }}
                                      className="h-4 w-4 rounded-full flex items-center justify-center text-[7px] text-white font-bold cursor-pointer hover:ring-1 hover:ring-accent-primary shadow-sm"
                                      style={{ background: u.avatarGradient || "var(--accent-primary)" }}
                                      title={`${u.firstName} ${u.lastName} logged time`}
                                    >
                                      {u.initials}
                                    </div>
                                  ))}
                                  {distinctUsers.length > 5 && <div className="text-[8px] text-muted ml-0.5 mt-0.5">+{distinctUsers.length - 5}</div>}
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* WEEK VIEW TIMETABLE (Agenda Stack Layout) */}
            {calendarView === "week" && (
              <div className="flex h-full min-w-[700px] overflow-y-auto">
                {/* Weekly Columns */}
                <div className="flex flex-1 divide-x divide-border-c relative h-full">
                  {weekDays.map((wd, i) => {
                    const chips = getChipsForDate(wd.dateStr);
                    const dayTasks = monthTasks.filter(t => t.startTime.startsWith(wd.dateStr));
                    const finalTasks = viewMode === "my" ? dayTasks.filter(t => t.userId === user?.id) : dayTasks;

                    // Sort tasks chronologically for agenda view
                    finalTasks.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

                    return (
                      <div key={i} className="flex-1 min-w-0 bg-surface flex flex-col relative group">
                        {/* Day Header */}
                        <div onClick={() => setActiveDay(wd.dateStr)} className="h-[50px] border-b border-border-c flex flex-col items-center justify-center cursor-pointer hover:bg-bg/50 shrink-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{wd.label}</span>
                          <span className={cn("text-lg font-serif leading-none mt-1", isToday(wd.dateStr) ? "text-accent-primary" : "text-text")}>{wd.day}</span>
                        </div>

                        {/* Schedule Chips summary */}
                        <div className="px-1 py-1 flex gap-1 flex-wrap min-h-[25px] border-b border-border-c bg-bg/20 shrink-0">
                          {chips.map((c, j) => (
                            <div key={j} className="h-1.5 w-1.5 rounded-full" style={{ background: c.config.borderColor }} title={c.isGroup ? `${c.config.label} (${c.users.map((u: any) => u.firstName).join(", ")})` : c.config.label} />
                          ))}
                        </div>

                        {/* Timetable Stack */}
                        <div className="flex-1 overflow-y-auto p-1 space-y-1.5 bg-bg/5">
                          {finalTasks.map(entry => {
                            const start = new Date(entry.startTime);
                            const end = new Date(entry.endTime || new Date());
                            const userObj = usersList.find(u => u.id === entry.userId) || entry.user;
                            const gradient = userObj?.avatarGradient || "linear-gradient(135deg, #3B6FE8, #7C5CBF)";

                            return (
                              <div
                                key={entry.id}
                                className="w-full rounded shadow-sm opacity-90 overflow-hidden border-l-2 hover:opacity-100 hover:brightness-95 transition-all text-[10px] flex flex-col"
                                style={{
                                  background: "var(--surface)",
                                  borderLeftColor: "transparent",
                                  backgroundImage: `linear-gradient(var(--surface), var(--surface)), ${gradient}`,
                                  backgroundOrigin: 'border-box',
                                  backgroundClip: 'padding-box, border-box'
                                }}
                              >
                                <div className="px-2 py-1.5 leading-tight bg-bg/50">
                                  <div className="font-semibold text-text break-words">
                                    {viewMode === "team" && <span className="font-bold opacity-70">[{userObj?.initials}] </span>}
                                    {entry.taskName}
                                  </div>
                                  <div className="text-[9px] text-muted mt-1 uppercase tracking-wider font-semibold">
                                    {formatTime(start.getHours() + ":" + start.getMinutes())} - {formatTime(end.getHours() + ":" + end.getMinutes())}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── RIGHT: TOGGL TIMELINE PANEL (Daily Details) ─────────────── */}
      {activeDay && (
        <div className="flex-1 min-w-[340px] max-w-[440px] shrink-0 border border-border-c bg-surface shadow-lg rounded-[var(--radius)] overflow-hidden flex flex-col animate-slide-in-right">

          {/* Daily Header */}
          <div className="border-b border-border-c px-6 py-5 flex items-center justify-between bg-bg/30">
            <div>
              <h3 className="font-serif text-2xl font-medium leading-tight">Timeline Log</h3>
              <p className="text-[11px] font-bold tracking-wider uppercase text-muted mt-1">{new Date(activeDay).toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <button onClick={() => { setActiveDay(null); cancelAdding(); }} className="p-2 hover:bg-bg border border-border-c rounded-md transition-colors"><X className="h-4 w-4 text-muted" /></button>
          </div>

          {/* Team Filter Pills (Only shown in Team mode) */}
          {viewMode === "team" && activeSiderUsers.length > 0 && (
            <div className="px-4 py-3 border-b border-border-c bg-surface/50 flex items-center gap-2 overflow-x-auto shrink-0">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest mr-2">Filter</span>
              {activeSiderUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => setActiveTeamFilter(activeTeamFilter === u.id ? null : u.id)}
                  className={cn(
                    "relative flex-shrink-0 h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center text-[10px] font-bold text-white shadow-sm",
                    activeTeamFilter === u.id ? "ring-2 ring-accent-primary ring-offset-2 border-transparent scale-110" : "border-surface hover:-translate-y-0.5",
                    activeTeamFilter && activeTeamFilter !== u.id ? "opacity-30 grayscale" : "opacity-100"
                  )}
                  style={{ background: u.avatarGradient }}
                  title={u.firstName + " " + u.lastName}
                >
                  {u.initials}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto relative p-6 bg-bg/20">
            {/* Legend/Hours markers */}
            <div className="absolute left-6 top-6 bottom-6 w-12 border-r border-border-c/50">
              {Array.from({ length: 25 }, (_, i) => (
                <div key={i} className="h-[60px] relative">
                  <span className="absolute -top-2 left-0 text-[10px] font-bold text-muted uppercase">{i}:00</span>
                </div>
              ))}
            </div>

            {/* Interactive Timeline Area */}
            <div
              ref={timelineRef}
              className={cn("ml-16 relative bg-surface border border-border-c rounded-lg h-[1440px] select-none shadow-sm transition-all", isAddingTask ? "pointer-events-none" : "cursor-crosshair", viewMode === "team" && "pointer-events-none")}
              onClick={viewMode === "my" ? handleTimelineClick : undefined}
              onMouseMove={viewMode === "my" ? handleTimelineMouseMove : undefined}
            >
              {/* Only show 'click to track' hint if viewing personal */}
              {viewMode === "team" && (
                <div className="absolute top-2 right-2 text-[10px] font-bold text-muted bg-surface/80 px-2 py-1 rounded">Read Only (Team Mode)</div>
              )}

              {/* Render Existing Blocks */}
              {selectedDayEntries.map(renderTimeBlock)}

              {/* Render Hover / Selecting Block (Pre-lock) */}
              {clickStart !== null && dragCurrent !== null && !isAddingTask && viewMode === "my" && (
                <div
                  className="absolute inset-x-0 mx-2 rounded-md bg-accent-primary/10 border-l-4 border-dashed border-accent-primary pointer-events-none z-10"
                  style={{
                    top: `${Math.min(clickStart, dragCurrent) * 60}px`,
                    height: `${Math.max(Math.abs(clickStart - dragCurrent) * 60, 15)}px`
                  }}
                />
              )}

              {/* INLINE EDITOR: Render the block actively being edited */}
              {isAddingTask && dragFinalStart !== null && dragFinalEnd !== null && viewMode === "my" && (
                <div
                  className="absolute inset-x-0 mx-2 rounded-md bg-white border border-accent-primary shadow-lg z-20 flex flex-col justify-center px-3 py-2 animate-fade-in pointer-events-auto"
                  style={{
                    top: `${Math.min(dragFinalStart, dragFinalEnd) * 60}px`,
                    height: `${Math.max(Math.abs(dragFinalStart - dragFinalEnd) * 60, 40)}px`
                  }}
                >
                  <input
                    autoFocus
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveTask();
                      if (e.key === 'Escape') cancelAdding();
                    }}
                    placeholder="Task Title... (Press Enter to save)"
                    className="w-full bg-transparent text-[11px] font-bold outline-none text-text placeholder:text-muted/60"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] font-medium tracking-wider text-muted uppercase">
                      {formatTime(Math.floor(Math.min(dragFinalStart, dragFinalEnd)) + ":" + (Math.min(dragFinalStart, dragFinalEnd) % 1) * 60)} - {formatTime(Math.floor(Math.max(dragFinalStart, dragFinalEnd)) + ":" + (Math.max(dragFinalStart, dragFinalEnd) % 1) * 60)}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={cancelAdding} className="text-[9px] text-muted hover:text-text">Cancel</button>
                      <button onClick={saveTask} className="text-[9px] text-accent-primary font-bold">Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: LEAVE REQUEST ─────────────── */}
      {isRequestingLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-border-c rounded-xl shadow-xl p-8 w-full max-w-md animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold">Request Leave</h2>
              <button onClick={() => setIsRequestingLeave(false)} className="text-muted hover:text-text"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={submitLeaveRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1">Start Date</label>
                  <input required type="date" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} className="w-full border border-border-c bg-bg rounded-md px-3 py-2 text-xs outline-none focus:border-accent-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1">End Date</label>
                  <input required type="date" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} className="w-full border border-border-c bg-bg rounded-md px-3 py-2 text-xs outline-none focus:border-accent-primary" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1">Reason (Optional)</label>
                <textarea value={leaveReason} onChange={e => setLeaveReason(e.target.value)} placeholder="e.g. Vacation, Sick, Personal..." className="w-full border border-border-c bg-bg rounded-md px-3 py-2 text-xs outline-none focus:border-accent-primary h-24 resize-none" />
              </div>

              <button type="submit" className="w-full bg-accent-primary text-white font-bold text-xs uppercase tracking-widest py-3 rounded-md hover:brightness-110 flex items-center justify-center gap-2">
                Submit Request <CheckCircle2 className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
