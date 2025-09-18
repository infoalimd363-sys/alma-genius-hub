import { Users, School, TrendingUp, AlertCircle, BarChart3, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const AdminDashboard = () => {
  return (
    <div className="p-6 space-y-6 animate-slide-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">Institution overview and management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button className="bg-gradient-accent">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">Students: 1200, Teachers: 80, Admin: 4</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <School className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.3%</div>
            <Progress value={89.3} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76.8%</div>
            <p className="text-xs text-muted-foreground">Average across all grades</p>
            <p className="text-xs text-secondary mt-1">+4.2% from last term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
            <Button size="sm" variant="outline" className="mt-2">View All</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Academic performance by department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { dept: "Mathematics", performance: 82, students: 320, trend: "up" },
              { dept: "Science", performance: 78, students: 315, trend: "up" },
              { dept: "English", performance: 85, students: 318, trend: "stable" },
              { dept: "Computer Science", performance: 88, students: 247, trend: "up" },
              { dept: "Social Studies", performance: 74, students: 300, trend: "down" },
            ].map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{dept.dept}</span>
                    <span className="text-sm text-muted-foreground">({dept.students} students)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{dept.performance}%</span>
                    {dept.trend === 'up' && <TrendingUp className="h-3 w-3 text-secondary" />}
                    {dept.trend === 'down' && <TrendingUp className="h-3 w-3 text-destructive rotate-180" />}
                  </div>
                </div>
                <Progress value={dept.performance} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent System Activities</CardTitle>
            <CardDescription>Latest administrative actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { action: "New teacher onboarded", user: "Admin", time: "1 hour ago" },
              { action: "Schedule updated", user: "Admin", time: "3 hours ago" },
              { action: "Report generated", user: "System", time: "Yesterday" },
              { action: "Backup completed", user: "System", time: "Yesterday" },
              { action: "Policy updated", user: "Admin", time: "2 days ago" },
            ].map((activity, index) => (
              <div key={index} className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};