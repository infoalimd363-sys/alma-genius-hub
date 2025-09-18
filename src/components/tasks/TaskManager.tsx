import { useState } from "react";
import { Plus, Clock, Target, BookOpen, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export const TaskManager = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const tasks = [
    {
      id: 1,
      title: "Complete Math Assignment",
      description: "Solve problems 1-20 from Chapter 5",
      category: "academic",
      priority: "high",
      deadline: "Today, 6:00 PM",
      progress: 60,
    },
    {
      id: 2,
      title: "Career Aptitude Assessment",
      description: "Take the online assessment to identify career interests",
      category: "career",
      priority: "medium",
      deadline: "Tomorrow",
      progress: 0,
    },
    {
      id: 3,
      title: "Science Project Research",
      description: "Research renewable energy sources",
      category: "academic",
      priority: "medium",
      deadline: "March 20",
      progress: 30,
    },
    {
      id: 4,
      title: "Join Debate Club Meeting",
      description: "Participate in weekly debate practice",
      category: "extracurricular",
      priority: "low",
      deadline: "Friday, 4:00 PM",
      progress: 0,
    },
    {
      id: 5,
      title: "Personal Development: Time Management",
      description: "Complete online course module on effective time management",
      category: "personal",
      priority: "low",
      deadline: "This Week",
      progress: 75,
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "academic":
        return <BookOpen className="h-4 w-4" />;
      case "career":
        return <Briefcase className="h-4 w-4" />;
      case "personal":
        return <Target className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredTasks = selectedCategory === "all" 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  return (
    <div className="p-6 space-y-6 animate-slide-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Task Manager</h2>
          <p className="text-muted-foreground">Personalized tasks for your free periods</p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">1</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setSelectedCategory("all")}>
            All Tasks
          </TabsTrigger>
          <TabsTrigger value="academic" onClick={() => setSelectedCategory("academic")}>
            Academic
          </TabsTrigger>
          <TabsTrigger value="career" onClick={() => setSelectedCategory("career")}>
            Career
          </TabsTrigger>
          <TabsTrigger value="personal" onClick={() => setSelectedCategory("personal")}>
            Personal
          </TabsTrigger>
          <TabsTrigger value="extracurricular" onClick={() => setSelectedCategory("extracurricular")}>
            Extracurricular
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(task.category)}
                      <Badge variant={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <Badge variant="outline">{task.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <CardDescription>{task.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="font-medium">{task.deadline}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} />
                  </div>
                  <Button className="w-full" variant="outline">
                    {task.progress > 0 ? "Continue" : "Start"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};