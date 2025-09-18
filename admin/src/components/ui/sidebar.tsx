"use client";
import * as React from "react";

// Minimal sidebar primitives inspired by shadcn/ui Sidebar
// Provides: SidebarProvider, useSidebar, Sidebar, SidebarHeader, SidebarFooter,
// SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
// SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean | ((v: boolean) => boolean)) => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children, defaultOpen = true, open: openProp, onOpenChange }: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, _setOpen] = React.useState<boolean>(openProp ?? defaultOpen);
  const open = openProp ?? internalOpen;

  const setOpen = React.useCallback(
    (value: boolean | ((v: boolean) => boolean)) => {
      const next = typeof value === "function" ? (value as (v: boolean) => boolean)(open) : value;
      if (onOpenChange) onOpenChange(next);
      else _setOpen(next);
      try {
        document.cookie = `sidebar_open=${String(next)}; path=/; max-age=${60 * 60 * 24 * 30}`;
      } catch {}
    },
    [open, onOpenChange]
  );

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className="flex min-h-dvh">
          {children}
        </div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider.");
  return ctx;
}

export function Sidebar({ children, collapsible = "icon", width = 260 }: {
  children?: React.ReactNode;
  collapsible?: "off" | "icon";
  width?: number;
}) {
  const { open } = useSidebar();
  const style: React.CSSProperties = { width, minWidth: width };
  const collapsed = collapsible === "icon" && !open;
  return (
    <aside
      data-collapsible={collapsible}
      data-state={open ? "open" : "collapsed"}
      className={`h-dvh sticky top-0 border-r bg-[var(--sidebar)] text-[var(--sidebar-foreground)] transition-[width] duration-200 ${collapsed ? 'w-[72px] min-w-[72px]' : ''}`}
      style={collapsed ? undefined : style}
    >
      <div className="flex h-full flex-col">
          {children}
      </div>
    </aside>
  );
}

export function SidebarHeader({ children }: { children?: React.ReactNode }) {
  return <div className="p-3 border-b sticky top-0 bg-[var(--sidebar)] z-10">{children}</div>;
}

export function SidebarFooter({ children }: { children?: React.ReactNode }) {
  return <div className="mt-auto p-3 border-t sticky bottom-0 bg-[var(--sidebar)] z-10">{children}</div>;
}

export function SidebarContent({ children }: { children?: React.ReactNode }) {
  return <div className="flex-1 overflow-auto p-2">{children}</div>;
}

export function SidebarGroup({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

export function SidebarGroupLabel({ children }: { children?: React.ReactNode }) {
  return <div className="px-2 py-1 text-xs font-semibold text-[var(--sidebar-foreground)]/70">{children}</div>;
}

export function SidebarGroupContent({ children }: { children?: React.ReactNode }) {
  return <div className="mt-1">{children}</div>;
}

export function SidebarMenu({ children }: { children?: React.ReactNode }) {
  return <nav className="flex flex-col gap-1">{children}</nav>;
}

export function SidebarMenuItem({ children }: { children?: React.ReactNode }) {
  return <div className="group/menu-item relative">{children}</div>;
}

export function SidebarMenuButton({ children, asChild = false, href }: { children: React.ReactNode; asChild?: boolean; href?: string }) {
  const content = (
    <div className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]">
      {children}
    </div>
  );
  if (asChild && href) return <a href={href}>{content}</a>;
  return content;
}

export function SidebarTrigger({ className = "" }: { className?: string }) {
  const { open, setOpen } = useSidebar();
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`inline-flex h-9 items-center rounded-md border px-3 text-sm bg-white dark:bg-black ${className}`}
    >
      {open ? "Hide" : "Show"} Menu
    </button>
  );
}
