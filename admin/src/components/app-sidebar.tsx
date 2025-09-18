"use client";
import React from 'react';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';

const items = [
  { title: 'Dashboard', url: '/dashboard' },
  { title: 'Services', url: '/services' },
  { title: 'Add Service', url: '/services/new' },
  { title: 'Categories', url: '/meta/categories' },
  { title: 'Service Types', url: '/meta/types' },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="font-bold">Admin</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>{item.title}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="text-xs opacity-70">v1.0</div>
      </SidebarFooter>
    </Sidebar>
  );
}


