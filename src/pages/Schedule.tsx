import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { schedulesService } from "@/services/schedules.service";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Schedule = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  useEffect(() => {
    loadSchedules();
  }, [user]);

  const loadSchedules = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [allSchedules, today] = await Promise.all([
        schedulesService.getUserSchedule(user.id),
        schedulesService.getTodaySchedule(user.id)
      ]);
      
      setSchedules(allSchedules || []);
      setTodaySchedule(today || []);
    } catch (error) {
      console.error('Failed to load schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const getScheduleForDay = (day: number) => {
    return schedules.filter(s => s.day_of_week === day).sort((a, b) => 
      a.start_time.localeCompare(b.start_time)
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'bg-primary/10 text-primary';
      case 'exam': return 'bg-destructive/10 text-destructive';
      case 'activity': return 'bg-accent/10 text-accent';
      case 'meeting': return 'bg-secondary/10 text-secondary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Class Schedule
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Button variant="outline" onClick={loadSchedules}>
          <Calendar className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="week" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">Full Week</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {todaySchedule.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No classes today!</p>
                <p className="text-sm text-muted-foreground">Enjoy your day off</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {todaySchedule.map((schedule) => (
                <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[80px]">
                        <p className="text-sm text-muted-foreground">
                          {formatTime(schedule.start_time)}
                        </p>
                        <p className="text-xs text-muted-foreground">to</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(schedule.end_time)}
                        </p>
                      </div>
                      <div className="h-16 w-1 bg-gradient-primary rounded-full" />
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{schedule.subject || 'Class'}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {schedule.room && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {schedule.room}
                            </span>
                          )}
                          {schedule.location && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {schedule.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={getTypeColor(schedule.type)}>
                      {schedule.type}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <div className="grid gap-4">
            {DAYS.map((day, index) => {
              const daySchedules = getScheduleForDay(index);
              const isToday = index === new Date().getDay();
              
              return (
                <Card key={day} className={isToday ? 'border-primary' : ''}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className={isToday ? 'text-primary' : ''}>{day}</span>
                      {isToday && <Badge variant="secondary">Today</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {daySchedules.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No classes</p>
                    ) : (
                      <div className="space-y-2">
                        {daySchedules.map((schedule) => (
                          <div key={schedule.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/5">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </span>
                            <span className="text-sm font-semibold flex-1">
                              {schedule.subject || 'Class'}
                            </span>
                            {schedule.room && (
                              <span className="text-sm text-muted-foreground">
                                {schedule.room}
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {schedule.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Schedule;