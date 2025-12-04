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
  GraduationCap,
  Bell,
  FileText,
  LayoutDashboard,
  Calendar,
  Clock,
  Loader2,
  Users,
} from "lucide-react";
import type { Session } from "next-auth";
import { listSchedulesAction } from "@/app/actions/schedules";
import { getStudentEnrollmentAction } from "@/app/actions/enrollments";

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
  subject: {
    id: string;
    name: string;
    code: string | null;
  };
  teacher: {
    id: string;
    name: string;
  };
}

interface StudentDashboardClientProps {
  session: Session;
}

export function StudentDashboardClient({
  session,
}: StudentDashboardClientProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [classCohort, setClassCohort] = useState<{
    name: string;
    level: string;
    grade: number;
  } | null>(null);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    setIsLoading(true);
    try {
      // Get current academic year (you might want to make this configurable)
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}/${currentYear + 1}`;

      // Fetch student's enrollment
      const enrollmentResult = await getStudentEnrollmentAction(
        session.user.id,
        academicYear
      );

      if (enrollmentResult.success && enrollmentResult.enrollment) {
        const enrollment = enrollmentResult.enrollment;

        // Set class cohort info
        setClassCohort({
          name: enrollment.class.name,
          level: enrollment.class.level,
          grade: enrollment.class.grade,
        });

        // Fetch schedules for the student's class
        const schedulesResult = await listSchedulesAction({
          classId: enrollment.class.id,
        });

        if (schedulesResult.success) {
          setSchedules(schedulesResult.schedules as Schedule[]);
        }
      } else {
        // Student not enrolled
        setSchedules([]);
        setClassCohort(null);
      }
    } catch (error) {
      console.error("Load student data error:", error);
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

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      href: "/student/dashboard",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "My Classes",
      href: "/student/classes",
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      label: "My Grades",
      href: "/student/grades",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Exams",
      href: "/student/exams",
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: "Notifications",
      href: "/student/notifications",
      badge: "5",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: "Schedule",
      href: "/student/schedule",
    },
  ];

  const stats = [
    {
      title: "My Class",
      value: isLoading ? "-" : classCohort ? classCohort.name : "Not Enrolled",
      subtitle: classCohort
        ? `${classCohort.level} - Grade ${classCohort.grade}`
        : "No class assigned",
      color: "bg-blue-500",
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Subjects",
      value: isLoading
        ? "-"
        : Array.from(
            new Set(schedules.map((s) => s.subject.id))
          ).length.toString(),
      subtitle: "This semester",
      color: "bg-green-500",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      title: "Weekly Sessions",
      value: isLoading ? "-" : schedules.length.toString(),
      subtitle: "Classes per week",
      color: "bg-purple-500",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      title: "Notifications",
      value: "0",
      subtitle: "New announcements",
      color: "bg-orange-500",
      icon: <Bell className="w-5 h-5" />,
    },
  ];

  return (
    <SidebarLayout
      menuItems={menuItems}
      userName={session.user.name || "Student"}
      userRole="Student"
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
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
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
                <div className="text-2xl font-bold text-gray-900 truncate">
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
          {/* My Class Cohort & Weekly Schedule */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                My Class & Schedule
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Your class cohort and weekly schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : !classCohort ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium">
                    Not enrolled in a class yet
                  </p>
                  <p className="text-xs mt-1">
                    Contact your administrator to be assigned to a class cohort
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Class Cohort Info */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {classCohort.name.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          Class {classCohort.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {classCohort.level} - Grade {classCohort.grade}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subjects List */}
                  {schedules.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        My Subjects (
                        {
                          Array.from(
                            new Set(schedules.map((s) => s.subject.id))
                          ).length
                        }
                        )
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(
                          new Set(schedules.map((s) => s.subject.name))
                        ).map((subject, idx) => (
                          <Badge key={idx} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Weekly Schedule
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Your class schedule for this week
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
                  <p className="text-sm">No schedule available</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(schedulesByDay)
                    .sort(
                      ([dayA], [dayB]) =>
                        getDayOrder(dayA as DayOfWeek) -
                        getDayOrder(dayB as DayOfWeek)
                    )
                    .map(([day, daySchedules]) => (
                      <div
                        key={day}
                        className="border-l-4 border-blue-500 pl-3 py-2"
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
                                className="flex items-start gap-2 py-1"
                              >
                                <span className="text-xs text-gray-500 w-20 flex-shrink-0 mt-0.5">
                                  {schedule.startTime} - {schedule.endTime}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 font-medium">
                                    {schedule.subject.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {schedule.teacher.name}
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

        {/* Recent Grades & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Grades */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Recent Grades
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Your latest graded assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    assignment: "Midterm Exam",
                    class: "MATH101",
                    grade: "95",
                    letter: "A",
                    trend: "up",
                  },
                  {
                    assignment: "Essay 2",
                    class: "ENG201",
                    grade: "88",
                    letter: "B+",
                    trend: "up",
                  },
                  {
                    assignment: "Lab 3",
                    class: "PHY301",
                    grade: "92",
                    letter: "A-",
                    trend: "up",
                  },
                ].map((grade, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {grade.assignment}
                      </p>
                      <p className="text-xs text-gray-500">{grade.class}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {grade.grade}
                        </p>
                        <p className="text-xs text-gray-500">{grade.letter}</p>
                      </div>
                      <GraduationCap className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Recent Notifications
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Latest announcements and updates
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    title: "New assignment posted",
                    class: "MATH101",
                    time: "2 hours ago",
                    unread: true,
                  },
                  {
                    title: "Grade updated for Essay 2",
                    class: "ENG201",
                    time: "5 hours ago",
                    unread: true,
                  },
                  {
                    title: "Class cancelled tomorrow",
                    class: "PHY301",
                    time: "1 day ago",
                    unread: false,
                  },
                ].map((notification, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      notification.unread
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 ${
                        notification.unread ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {notification.class} • {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
