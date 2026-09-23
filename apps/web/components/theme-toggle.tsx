"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render placeholder to avoid hydration layout shift
    return (
      <button
        aria-label="Toggle theme"
        className="size-9 rounded-[var(--r-md)] border border-border bg-surface-2 text-muted inline-flex items-center justify-center opacity-60 cursor-default"
      >
        <div className="size-4.5" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`size-9 rounded-[var(--r-md)] border border-border bg-surface text-ink hover:bg-surface-2 inline-flex items-center justify-center transition-all duration-120 cursor-pointer shadow-xs ${className ?? ""}`}
    >
      {isDark ? (
        <Sun className="size-4.5 text-amber transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="size-4.5 text-teal transition-transform duration-200 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
