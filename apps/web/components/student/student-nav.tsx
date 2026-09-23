"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { signOutAction } from "@/actions/auth-actions";
import {
  LayoutDashboard,
  GraduationCap,
  Calendar,
  BookOpen,
  TrendingUp,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Globe,
  Bell,
  Shield,
  X,
} from "lucide-react";

interface StudentNavProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    timezone: string;
    avatarUrl?: string | null;
  };
}

export function StudentNav({ user }: StudentNavProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const navTabs = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Classes", href: "/student/classes", icon: GraduationCap },
    { label: "Lessons", href: "/student/lessons", icon: Calendar },
    { label: "Vocabulary", href: "/student/vocabulary", icon: BookOpen },
    { label: "Progress", href: "/student/progress", icon: TrendingUp },
  ];

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/student/dashboard" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-[var(--r-md)] bg-teal font-display text-[18px] font-bold text-white shadow-xs">
                L
              </div>
              <span className="font-display text-[20px] font-semibold text-ink hidden sm:inline">
                LinguaClass
              </span>
            </Link>
            <span className="rounded-full bg-amber-light px-2.5 py-0.5 text-[11px] font-semibold text-amber-dark border border-amber/30 hidden md:inline-block">
              Student Portal
            </span>
          </div>

          {/* Center: 5 Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                pathname === tab.href ||
                (tab.href !== "/student/dashboard" && pathname.startsWith(tab.href));

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-teal text-white shadow-xs"
                      : "text-muted hover:text-ink hover:bg-surface-2"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: ThemeToggle + Profile Dropdown */}
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />

            {/* Profile Dropdown Container */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-2 border border-transparent hover:border-border transition-all cursor-pointer"
                aria-label="Open student profile menu"
              >
                <div className="size-8 rounded-full bg-teal-light text-teal font-display text-sm font-bold flex items-center justify-center border border-teal-mid/40">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <span className="block text-xs font-semibold text-ink leading-tight truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="block text-[10px] text-muted leading-tight">Student</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted" />
              </button>

              {/* Profile Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-surface border border-border shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
                  {/* User Profile Header */}
                  <div className="p-3 rounded-xl bg-surface-2/60 border border-border/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-ink">{user.name}</span>
                      <Badge variant="cefr-a">Student</Badge>
                    </div>
                    <p className="text-[11px] text-muted truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-teal pt-1 font-mono">
                      <Globe className="w-3 h-3" />
                      <span>{user.timezone}</span>
                    </div>
                  </div>

                  {/* Settings Item */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink hover:bg-surface-2 transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-teal" />
                    <span>Account & Preferences</span>
                  </button>

                  <div className="h-px bg-border/60 my-1" />

                  {/* Sign Out */}
                  <form action={signOutAction} className="w-full">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-coral hover:bg-coral-light/20 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Account & Preferences Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl p-6 relative space-y-5">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-muted hover:text-ink hover:bg-surface-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal" />
                Account Settings & Preferences
              </h3>
              <p className="text-xs text-muted">
                Manage your student profile, timezone synchronization, and learning settings.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-2 border border-border/80 space-y-1.5">
                <span className="font-semibold text-ink block">Student Profile</span>
                <p className="text-muted">Name: <strong className="text-ink">{user.name}</strong></p>
                <p className="text-muted">Email: <strong className="text-ink">{user.email}</strong></p>
                <p className="text-muted">Local Timezone: <strong className="text-teal font-mono">{user.timezone}</strong></p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-2 border border-border/80 space-y-2">
                <span className="font-semibold text-ink block flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-teal" /> Notifications & Audio
                </span>
                <div className="flex items-center justify-between text-muted">
                  <span>Lesson reminders (15m before class)</span>
                  <input type="checkbox" defaultChecked className="accent-teal rounded" />
                </div>
                <div className="flex items-center justify-between text-muted">
                  <span>Pronunciation audio auto-play</span>
                  <input type="checkbox" defaultChecked className="accent-teal rounded" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-light/20 border border-teal-mid/30 text-teal text-[11px] flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span>COPPA & GDPR privacy compliant. All live session recordings require consent.</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button variant="primary" size="sm" onClick={() => setIsSettingsOpen(false)}>
                Save & Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
