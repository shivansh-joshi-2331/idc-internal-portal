"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import ProfileModal from "./ProfileModal";
import {
  LayoutGrid,
  Calendar,
  Users,
  Star,
  BookOpen,
  Megaphone,
  Settings,
  LogOut,
  Bell,
  Check
} from "lucide-react";

const NAV_ITEMS = [
  {
    section: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
      { label: "Schedule", href: "/schedule", icon: Calendar },
      { label: "Team", href: "/team", icon: Users },
      { label: "Leaderboard", href: "/leaderboard", icon: Star },
      { label: "Handbook", href: "/handbook", icon: BookOpen },
      { label: "Announcements", href: "/announcements", icon: Megaphone },
    ],
  },
];

const ADMIN_ITEMS = {
  section: "Admin",
  items: [
    { label: "Manage Schedule", href: "/admin/schedule", icon: Calendar },
    { label: "Challenges", href: "/admin/challenges", icon: Star },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, isAdmin, logout } = useAuthStore();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:4000/api/notifications", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
         if(Array.isArray(data)) setNotifications(data);
      })
      .catch(console.error);
  }, [token]);

  const handleRead = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (e) {}
  };

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) handleRead(n.id);
    if (n.type === 'LEAVE_REQUEST') {
      router.push(isAdmin ? '/admin/schedule' : '/schedule');
      setShowNotifs(false);
    }
  };

  if (!user) return null;

  const isProfileComplete = user.bio && user.skills && user.skills.length > 0;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const allSections = isAdmin ? [...NAV_ITEMS, ADMIN_ITEMS] : NAV_ITEMS;

  return (
    <aside className="fixed top-0 left-0 z-50 flex h-screen w-[var(--sidebar-width)] flex-col bg-sidebar border-r border-border-c">
      {/* Logo */}
      <div className="border-b border-border-c px-6 pb-5 pt-6">
        <Link href="/dashboard" className="block">
          <div className="font-display text-[28px] font-bold tracking-tighter text-text">
            IDC<span className="text-accent-primary">.</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {allSections.map((section) => (
          <div key={section.section} className="mb-6">
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
              {section.section}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;
              const isAdminItem = section.section === "Admin";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-blue-bg text-accent-primary"
                      : "text-sidebar-text hover:bg-bg hover:text-text",
                    isAdminItem && isActive && "bg-amber-bg text-accent-secondary"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-accent-primary" : "text-muted group-hover:text-text",
                      isAdminItem && isActive && "text-accent-secondary"
                    )}
                  />
                  {item.label}
                  {isAdminItem && (
                    <span className="ml-auto rounded bg-accent-secondary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent-secondary">
                      Admin
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Role indicator */}
      {/* <div className="flex gap-1 border-t border-border-c px-4 py-4">
        <button
          className={cn(
            "flex-1 rounded-md py-1.5 text-center text-[11px] font-medium transition-all",
            !isAdmin
              ? "bg-blue-bg text-accent-primary border border-blue-border"
              : "border border-transparent text-muted hover:bg-bg"
          )}
        >
          Employee
        </button>
        <button
          className={cn(
            "flex-1 rounded-md py-1.5 text-center text-[11px] font-medium transition-all",
            isAdmin
              ? "bg-blue-bg text-accent-primary border border-blue-border"
              : "border border-transparent text-muted hover:bg-bg"
          )}
        >
          Admin
        </button>
      </div> */}

      {/* User */}
      <div className="relative">
        <div 
          className="group flex items-center gap-3 border-t border-border-c px-4 py-4 cursor-pointer hover:bg-bg transition-colors"
          onClick={() => setShowProfile(true)}
        >
          <div className="relative">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white shadow-sm"
              style={{ background: user.avatarGradient }}
            >
              {user.initials}
            </div>
            {!isProfileComplete && (
              <span 
                className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-surface" 
                title="Complete your profile!"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-text">
              {user.firstName} {user.lastName[0]}.
            </div>
            <div className="text-[11px] text-muted">{user.jobTitle}</div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifs(!showNotifs);
            }}
            className="relative rounded-md p-1.5 text-muted transition-colors hover:bg-border-c hover:text-text"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent-primary" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-border-c hover:text-text"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Notifications Popover */}
        {showNotifs && (
          <div className="absolute bottom-16 left-4 w-72 bg-surface border border-border-c rounded-xl shadow-xl overflow-hidden z-[200] animate-fade-in">
            <div className="px-4 py-3 border-b border-border-c bg-bg flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider">Notifications</h3>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-border-c">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted">No notifications</div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      "p-3 text-[13px] cursor-pointer hover:bg-bg/50 transition-colors", 
                      !n.isRead ? "bg-accent-primary/5" : "opacity-70"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <strong className="text-text">{n.title}</strong>
                      {!n.isRead && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRead(n.id);
                          }} 
                          className="text-accent-primary hover:text-text" 
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-muted text-xs">{n.body}</p>
                    <span className="text-[10px] text-muted/70 mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </aside>
  );
}
