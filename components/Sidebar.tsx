"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

const navItems = [
  { label: "Overview", href: "/" },
  { label: "Analytics", href: "/analytics" },
  { label: "Users", href: "/users" },
  { label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { dark, toggleDark } = useTheme();

  return (
    <aside
      className="w-60 shrink-0 flex flex-col h-full transition-colors duration-200"
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      <div
        className="px-6 py-5"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <span
          className="text-lg font-semibold"
          style={{ color: "var(--sidebar-text-strong)" }}
        >
          Dashboard
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
              style={
                active
                  ? {
                      background: "var(--sidebar-active-bg)",
                      color: "var(--sidebar-active-text)",
                    }
                  : {
                      color: "var(--sidebar-text)",
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--sidebar-hover-bg)";
                  e.currentTarget.style.color = "var(--sidebar-text-strong)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "";
                  e.currentTarget.style.color = "var(--sidebar-text)";
                }
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div
        className="px-4 py-4"
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm"
            style={{
              background: "var(--sidebar-active-bg)",
              color: "var(--sidebar-active-text)",
            }}
          >
            H
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: "var(--sidebar-text-strong)" }}
            >
              Huilen
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "var(--sidebar-text-muted)" }}
            >
              huilenvilches@gmail.com
            </p>
          </div>
        </div>

        <button
          onClick={toggleDark}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors"
          style={{
            color: "var(--sidebar-text)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--sidebar-hover-bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <span>{dark ? "Light mode" : "Dark mode"}</span>
          <span className="text-base">{dark ? "☀️" : "🌙"}</span>
        </button>
      </div>
    </aside>
  );
}
