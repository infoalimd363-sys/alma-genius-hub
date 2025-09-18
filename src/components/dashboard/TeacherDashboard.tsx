import { Users, ClipboardCheck, BookOpen, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const TeacherDashboard = () => {
  return (
    <div className="p-6 space-y-6 animate-slide-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Teacher Dashboard</h2>
          <p className="text-muted-foreground">Manage your classes and students</p>
        </div>
        <Button className="bg-gradient-secondary">
          <ClipboardCheck className="mr-2 h-4 w-4" />
          Mark Attendance
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Across 5 classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <Progress value={92} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">144 present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments Graded</CardTitle>
            <BookOpen className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28/35</div>
            <Progress value={80} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">7 pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5%</div>
            <p className="text-xs text-muted-foreground">+3.2% improvement</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Classes</CardTitle>
            <CardDescription>Your teaching schedule for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { time: "9:00 AM", class: "Grade 10-A", subject: "Mathematics", status: "completed" },
              { time: "10:30 AM", class: "Grade 11-B", subject: "Advanced Math", status: "completed" },
              { time: "2:00 PM", class: "Grade 10-C", subject: "Mathematics", status: "upcoming" },
              { time: "3:30 PM", class: "Grade 12-A", subject: "Calculus", status: "upcoming" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{item.class} - {item.subject}</p>
                  <p className="text-sm text-muted-foreground">{item.time}</p>
                </div>
                <Button size="sm" variant={item.status === 'completed' ? 'outline' : 'default'}>
                  {item.status === 'completed' ? 'View' : 'Start'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your classes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { action: "Attendance marked", class: "Grade 10-A", time: "2 hours ago" },
              { action: "Assignment graded", class: "Grade 11-B", time: "3 hours ago" },
              { action: "New task assigned", class: "Grade 12-A", time: "Yesterday" },
              { action: "Quiz results published", class: "Grade 10-C", time: "Yesterday" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.class} • {activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};