"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import Sidebar from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/ui/Toast";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!mounted || !user) return null;

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <main className="ml-[var(--sidebar-width)] flex-1 p-8 max-w-[1200px]">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
