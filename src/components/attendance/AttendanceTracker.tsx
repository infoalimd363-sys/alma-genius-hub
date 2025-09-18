import { useState } from "react";
import { QrCode, Wifi, Camera, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export const AttendanceTracker = () => {
  const [checkInMethod, setCheckInMethod] = useState<string>("");
  const { toast } = useToast();

  const handleCheckIn = (method: string) => {
    setCheckInMethod(method);
    toast({
      title: "Check-in Successful",
      description: `You've been marked present using ${method}`,
    });
  };

  return (
    <div className="p-6 space-y-6 animate-slide-in">
      <div>
        <h2 className="text-3xl font-bold">Attendance Tracking</h2>
        <p className="text-muted-foreground">Mark your attendance for today's classes</p>
      </div>

      <Tabs defaultValue="checkin" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="checkin">Check In</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Check-in Method</CardTitle>
              <CardDescription>Choose how you want to mark your attendance</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="h-32 flex-col gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => handleCheckIn("QR Code")}
              >
                <QrCode className="h-8 w-8 text-primary" />
                <span>QR Code</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-32 flex-col gap-2 hover:border-secondary hover:bg-secondary/5"
                onClick={() => handleCheckIn("Wi-Fi Proximity")}
              >
                <Wifi className="h-8 w-8 text-secondary" />
                <span>Wi-Fi Proximity</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-32 flex-col gap-2 hover:border-accent hover:bg-accent/5"
                onClick={() => handleCheckIn("Facial Recognition")}
              >
                <Camera className="h-8 w-8 text-accent" />
                <span>Facial Recognition</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-32 flex-col gap-2 hover:border-muted-foreground hover:bg-muted"
                onClick={() => handleCheckIn("Manual")}
              >
                <Edit className="h-8 w-8 text-muted-foreground" />
                <span>Manual Entry</span>
              </Button>
            </CardContent>
          </Card>

          {checkInMethod && (
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Mathematics - Room 203</p>
                    <p className="text-lg font-semibold">Marked Present</p>
                  </div>
                  <Badge className="bg-secondary text-secondary-foreground">Present</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Your attendance record for this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "March 15, 2024", status: "present", classes: 5 },
                  { date: "March 14, 2024", status: "present", classes: 4 },
                  { date: "March 13, 2024", status: "absent", classes: 5 },
                  { date: "March 12, 2024", status: "present", classes: 5 },
                  { date: "March 11, 2024", status: "late", classes: 5 },
                ].map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{record.date}</p>
                      <p className="text-sm text-muted-foreground">{record.classes} classes</p>
                    </div>
                    <Badge
                      variant={
                        record.status === "present" ? "default" :
                        record.status === "absent" ? "destructive" :
                        "secondary"
                      }
                    >
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};