// ─── User & Auth ───
export type Role = "EMPLOYEE" | "ADMIN";
export type Department = "DESIGN" | "STRATEGY" | "VIDEO" | "OPS";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  initials: string;
  role: Role;
  department: Department;
  jobTitle: string;
  bio: string;
  avatarGradient: string;
  skills: string[];
  socialLinks?: { linkedin?: string; behance?: string; twitter?: string };
  funFact?: string;
  joinedAt: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// ─── Schedule ───
export type ShiftType = "IN_OFFICE" | "REMOTE" | "DAY_OFF" | "HOLIDAY" | "GAMES_DAY" | "LEAVE";
export type AttendanceStatus = "in" | "remote" | "out";

export interface ScheduleEntry {
  id: string;
  userId: string;
  date: string;
  type: ShiftType;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  isPaid: boolean;
}

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LeaveRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: LeaveStatus;
  createdAt: string;
}

// ─── Time Tracking ───
export interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  duration?: number; // minutes
  notes?: string;
}

// ─── Leaderboard ───
export interface LeaderboardEntry {
  userId: string;
  user: User;
  totalPoints: number;
  weeklyDelta: number;
  rank: number;
  badges: string[];
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description?: string;
  points: number;
  weekStart: string;
  weekEnd: string;
  isActive: boolean;
  icon: string;
  completed?: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
}

// ─── Announcements ───
export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: Priority;
  authorId: string;
  author?: User;
  createdAt: string;
  expiresAt?: string;
}

// ─── Handbook ───
export interface HandbookSection {
  id: string;
  title: string;
  slug: string;
  category: string;
  icon?: string;
  content: string;
  sortOrder: number;
}

// ─── UI Helpers ───
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  section: "workspace" | "ops" | "admin";
  adminOnly?: boolean;
}

export const SHIFT_CONFIG: Record<ShiftType, { label: string; color: string; bg: string; borderColor: string }> = {
  IN_OFFICE: { label: "In office", color: "var(--green-text)", bg: "var(--green-bg)", borderColor: "var(--green-border)" },
  REMOTE: { label: "Remote", color: "var(--blue-text)", bg: "var(--blue-bg)", borderColor: "var(--blue-border)" },
  DAY_OFF: { label: "Day off", color: "var(--muted)", bg: "var(--bg)", borderColor: "var(--border)" },
  HOLIDAY: { label: "Holiday", color: "var(--amber-text)", bg: "var(--amber-bg)", borderColor: "var(--amber-border)" },
  GAMES_DAY: { label: "Games day", color: "var(--purple-text)", bg: "var(--purple-bg)", borderColor: "var(--purple-border)" },
  LEAVE: { label: "Leave", color: "var(--coral-text)", bg: "var(--coral-bg)", borderColor: "var(--coral-border)" },
};

export const DEPT_CONFIG: Record<Department, { label: string; color: string; bg: string; borderColor: string }> = {
  DESIGN: { label: "Design", color: "var(--blue-text)", bg: "var(--blue-bg)", borderColor: "var(--blue-border)" },
  STRATEGY: { label: "Strategy", color: "var(--green-text)", bg: "var(--green-bg)", borderColor: "var(--green-border)" },
  VIDEO: { label: "Video", color: "var(--coral-text)", bg: "var(--coral-bg)", borderColor: "var(--coral-border)" },
  OPS: { label: "Ops", color: "var(--amber-text)", bg: "var(--amber-bg)", borderColor: "var(--amber-border)" },
};

export const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string }> = {
  in: { label: "In office", color: "var(--accent-green)" },
  remote: { label: "Remote", color: "var(--accent-blue)" },
  out: { label: "OOO", color: "var(--muted)" },
};
