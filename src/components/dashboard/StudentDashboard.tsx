import { Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const StudentDashboard = () => {
  const attendancePercentage = 85;
  const averageGrade = 87.5;
  const tasksCompleted = 12;
  const totalTasks = 15;

  return (
    <div className="p-6 space-y-6 animate-slide-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Welcome back, Student!</h2>
          <p className="text-muted-foreground">Here's your academic overview</p>
        </div>
        <Button className="bg-gradient-primary">
          <Calendar className="mr-2 h-4 w-4" />
          View Schedule
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <CheckCircle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendancePercentage}%</div>
            <Progress value={attendancePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Present this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGrade}%</div>
            <Progress value={averageGrade} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">+2.5% from last semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksCompleted}/{totalTasks}</div>
            <Progress value={(tasksCompleted / totalTasks) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">{totalTasks - tasksCompleted} remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Class</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2:00 PM</div>
            <p className="text-xs text-muted-foreground">Mathematics - Room 203</p>
            <p className="text-xs text-muted-foreground mt-2">In 45 minutes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your classes and activities for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { time: "9:00 AM", subject: "Physics", room: "Lab 1", status: "completed" },
              { time: "10:30 AM", subject: "English", room: "Room 105", status: "completed" },
              { time: "2:00 PM", subject: "Mathematics", room: "Room 203", status: "upcoming" },
              { time: "3:30 PM", subject: "Computer Science", room: "Lab 3", status: "upcoming" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${item.status === 'completed' ? 'bg-secondary' : 'bg-accent'}`} />
                  <div>
                    <p className="font-medium">{item.subject}</p>
                    <p className="text-sm text-muted-foreground">{item.time} • {item.room}</p>
                  </div>
                </div>
                {item.status === 'completed' && <CheckCircle className="h-4 w-4 text-secondary" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>Tasks to complete during free periods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Math Assignment", deadline: "Today", priority: "high" },
              { title: "Science Project Research", deadline: "Tomorrow", priority: "medium" },
              { title: "Career Aptitude Test", deadline: "This Week", priority: "low" },
            ].map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    task.priority === 'high' ? 'bg-destructive' : 
                    task.priority === 'medium' ? 'bg-accent' : 'bg-secondary'
                  }`} />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">Due: {task.deadline}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Start</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};