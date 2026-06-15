"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Overview", href: "/" },
  { label: "Analytics", href: "/analytics" },
  { label: "Users", href: "/users" },
  { label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`shrink-0 border-r border-gray-200 bg-white flex flex-col h-full overflow-hidden transition-[width] duration-300 ease-in-out ${
        collapsed ? "w-14" : "w-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-5 border-b border-gray-200">
        <span
          className={`text-lg font-semibold text-gray-900 whitespace-nowrap transition-[opacity,transform] duration-200 ${
            collapsed ? "opacity-0 -translate-x-2 pointer-events-none" : "opacity-100 translate-x-0"
          }`}
        >
          Dashboard
        </span>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const initial = item.label[0];
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {/* Icon placeholder — letter avatar keeps layout stable when collapsed */}
              <span className="shrink-0 w-5 h-5 flex items-center justify-center text-xs font-semibold rounded">
                {initial}
              </span>
              <span
                className={`whitespace-nowrap transition-[opacity,transform] duration-200 ${
                  collapsed ? "opacity-0 -translate-x-2 pointer-events-none" : "opacity-100 translate-x-0"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-1">
          <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm">
            H
          </div>
          <div
            className={`flex-1 min-w-0 transition-[opacity,transform] duration-200 ${
              collapsed ? "opacity-0 -translate-x-2 pointer-events-none" : "opacity-100 translate-x-0"
            }`}
          >
            <p className="text-sm font-medium text-gray-900 truncate">Huilen</p>
            <p className="text-xs text-gray-500 truncate">huilenvilches@gmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
