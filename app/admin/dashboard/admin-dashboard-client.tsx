"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Bell,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Calendar,
  Filter,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function AdminDashboardClient() {
  const { data: session } = useSession();

  const stats = [
    {
      title: "Total Users",
      value: "250",
      change: "+12 more than last quarter",
      trend: "up",
      icon: <Users className="w-5 h-5" />,
      color: "bg-orange-500",
    },
    {
      title: "Active Classes",
      value: "42",
      change: "+0.2% more than last quarter",
      trend: "up",
      icon: <BookOpen className="w-5 h-5" />,
      color: "bg-red-500",
    },
    {
      title: "Total Enrollments",
      value: "856",
      change: "+4% more than last quarter",
      trend: "up",
      icon: <GraduationCap className="w-5 h-5" />,
      color: "bg-purple-500",
    },
    {
      title: "Active Teachers",
      value: "18",
      change: "Without changes",
      trend: "neutral",
      icon: <Users className="w-5 h-5" />,
      color: "bg-blue-500",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome {session?.user?.name}!
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
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Sep 11 - Oct 10
            </Button>
            <Button variant="outline" size="sm">
              Monthly
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div
                  className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white`}
                >
                  {stat.icon}
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === "up" && (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  )}
                  {stat.trend === "down" && (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-xs ${
                      stat.trend === "up"
                        ? "text-green-600"
                        : stat.trend === "down"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Activity Card */}
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  User Activity
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Recent user registrations and activity
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "John Doe",
                    role: "Student",
                    action: "Enrolled in Math 101",
                    time: "2 hours ago",
                  },
                  {
                    name: "Jane Smith",
                    role: "Teacher",
                    action: "Created new assignment",
                    time: "4 hours ago",
                  },
                  {
                    name: "Bob Johnson",
                    role: "Student",
                    action: "Submitted exam",
                    time: "6 hours ago",
                  },
                  {
                    name: "Alice Brown",
                    role: "Teacher",
                    action: "Graded assignments",
                    time: "1 day ago",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {activity.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.name}
                      </p>
                      <p className="text-xs text-gray-500">{activity.action}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/users">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-sm">Manage Users</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center gap-2"
                  disabled
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="text-sm">Create Class</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center gap-2"
                  disabled
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">View Reports</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center gap-2"
                  disabled
                >
                  <Bell className="w-5 h-5" />
                  <span className="text-sm">Send Announcement</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Classes Table */}
        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Recent Classes
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Recently created or updated classes
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Class Code
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Teacher
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Enrollments
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      code: "MATH101",
                      name: "Calculus I",
                      teacher: "Dr. Smith",
                      enrollments: 28,
                      status: "Active",
                    },
                    {
                      code: "ENG201",
                      name: "English Literature",
                      teacher: "Prof. Johnson",
                      enrollments: 32,
                      status: "Active",
                    },
                    {
                      code: "PHY301",
                      name: "Physics III",
                      teacher: "Dr. Brown",
                      enrollments: 24,
                      status: "Active",
                    },
                  ].map((classItem, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {classItem.code}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {classItem.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {classItem.teacher}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {classItem.enrollments}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          {classItem.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
