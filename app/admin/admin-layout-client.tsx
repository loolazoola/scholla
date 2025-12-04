"use client";

import { SidebarLayout } from "@/components/layout/sidebar-layout";
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  LayoutDashboard,
  Settings,
  Bell,
  BookMarked,
  CalendarDays,
  UserPlus,
} from "lucide-react";
import type { Session } from "next-auth";

interface AdminLayoutClientProps {
  session: Session;
  children: React.ReactNode;
}

export function AdminLayoutClient({
  session,
  children,
}: AdminLayoutClientProps) {
  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      href: "/admin/dashboard",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Users",
      href: "/admin/users",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Class Cohorts",
      href: "/admin/class-cohorts",
    },
    {
      icon: <BookMarked className="w-5 h-5" />,
      label: "Subjects",
      href: "/admin/subjects",
    },
    {
      icon: <CalendarDays className="w-5 h-5" />,
      label: "Schedules",
      href: "/admin/schedules",
    },
    {
      icon: <UserPlus className="w-5 h-5" />,
      label: "Enrollments",
      href: "/admin/enrollments",
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      label: "Grading Policies",
      href: "/admin/grading-policies",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Reports",
      href: "/admin/reports",
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: "Announcements",
      href: "/admin/announcements",
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      href: "/admin/settings",
    },
  ];

  return (
    <SidebarLayout
      menuItems={menuItems}
      userName={session.user.name || "Admin"}
      userRole="Administrator"
    >
      {children}
    </SidebarLayout>
  );
}
