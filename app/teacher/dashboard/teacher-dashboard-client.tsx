"use client";

import { useEffect, useState } from "react";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ClipboardList,
  Users,
  FileText,
  LayoutDashboard,
  Bell,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react";
import type { Session } from "next-auth";
import { listSchedulesAction } from "@/app/actions/schedules";

type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

interface Schedule {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string | null;
  class: {
    id: string;
    name: string;
    level: string;
    grade: number;
  };
  subject: {
    id: string;
    name: string;
    code: string | null;
  };
}

interface TeacherDashboardClientProps {
  session: Session;
}

export function TeacherDashboardClient({
  session,
}: TeacherDashboardClientProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const result = await listSchedulesAction({
        teacherId: session.user.id,
      });
      if (result.success) {
        setSchedules(result.schedules as Schedule[]);
      }
    } catch (error) {
      console.error("Load schedules error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayLabel = (day: DayOfWeek) => {
    const labels = {
      MONDAY: "Monday",
      TUESDAY: "Tuesday",
      WEDNESDAY: "Wednesday",
      THURSDAY: "Thursday",
      FRIDAY: "Friday",
      SATURDAY: "Saturday",
      SUNDAY: "Sunday",
    };
    return labels[day];
  };

  const getDayOrder = (day: DayOfWeek) => {
    const order = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
      SUNDAY: 7,
    };
    return order[day];
  };

  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.dayOfWeek]) {
      acc[schedule.dayOfWeek] = [];
    }
    acc[schedule.dayOfWeek].push(schedule);
    return acc;
  }, {} as Record<DayOfWeek, Schedule[]>);

  // Get unique class cohorts
  const uniqueClasses = Array.from(
    new Set(schedules.map((s) => s.class.id))
  ).map((id) => schedules.find((s) => s.class.id === id)!.class);

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      href: "/teacher/dashboard",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "My Classes",
      href: "/teacher/classes",
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Gradebook",
      href: "/teacher/gradebook",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Exams",
      href: "/teacher/exams",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Students",
      href: "/teacher/students",
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: "Announcements",
      href: "/teacher/announcements",
      badge: "2",
    },
  ];

  const stats = [
    {
      title: "Teaching Schedules",
      value: isLoading ? "-" : schedules.length.toString(),
      subtitle: "Weekly sessions",
      color: "bg-blue-500",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      title: "Class Cohorts",
      value: isLoading ? "-" : uniqueClasses.length.toString(),
      subtitle: "Different classes",
      color: "bg-green-500",
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Subjects",
      value: isLoading
        ? "-"
        : Array.from(
            new Set(schedules.map((s) => s.subject.id))
          ).length.toString(),
      subtitle: "Teaching this semester",
      color: "bg-purple-500",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      title: "This Week",
      value: isLoading ? "-" : Object.keys(schedulesByDay).length.toString(),
      subtitle: "Teaching days",
      color: "bg-orange-500",
      icon: <Clock className="w-5 h-5" />,
    },
  ];

  return (
    <SidebarLayout
      menuItems={menuItems}
      userName={session.user.name || "Teacher"}
      userRole="Teacher"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome {session.user.name}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Today is{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {session.user.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white`}
                  >
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {stat.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Teaching Schedule */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                My Teaching Schedule
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Classes you teach this semester
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : schedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No teaching schedule assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {schedules.slice(0, 6).map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-xs">
                              {schedule.subject.code ||
                                schedule.subject.name.slice(0, 2)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {schedule.subject.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {schedule.class.name} ({schedule.class.level} -
                              Grade {schedule.class.grade})
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getDayLabel(schedule.dayOfWeek)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                              {schedule.room && (
                                <span className="text-xs text-gray-500">
                                  • {schedule.room}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {schedules.length > 6 && (
                    <Button variant="ghost" size="sm" className="w-full">
                      View All {schedules.length} Schedules
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Class Cohorts */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Class Cohorts
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Student groups you teach
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : uniqueClasses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No class cohorts assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uniqueClasses.map((classCohort) => {
                    const classSchedules = schedules.filter(
                      (s) => s.class.id === classCohort.id
                    );
                    const subjects = Array.from(
                      new Set(classSchedules.map((s) => s.subject.name))
                    );

                    return (
                      <div
                        key={classCohort.id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-xs">
                              {classCohort.name.slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {classCohort.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {classCohort.level} - Grade {classCohort.grade}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {subjects.slice(0, 3).map((subject, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {subject}
                                </Badge>
                              ))}
                              {subjects.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{subjects.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {classSchedules.length} sessions/week
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Schedule */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Weekly Schedule
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Your teaching schedule organized by day
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : Object.keys(schedulesByDay).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No schedule for this week</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(schedulesByDay)
                  .sort(
                    ([dayA], [dayB]) =>
                      getDayOrder(dayA as DayOfWeek) -
                      getDayOrder(dayB as DayOfWeek)
                  )
                  .map(([day, daySchedules]) => (
                    <div
                      key={day}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <p className="text-sm font-semibold text-gray-900 mb-2">
                        {getDayLabel(day as DayOfWeek)}
                      </p>
                      <div className="space-y-2">
                        {daySchedules
                          .sort((a, b) =>
                            a.startTime.localeCompare(b.startTime)
                          )
                          .map((schedule) => (
                            <div
                              key={schedule.id}
                              className="flex items-start gap-3 py-1"
                            >
                              <span className="text-xs text-gray-500 w-24 flex-shrink-0 mt-0.5">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 font-medium">
                                  {schedule.subject.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {schedule.class.name}
                                  {schedule.room && ` • ${schedule.room}`}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
