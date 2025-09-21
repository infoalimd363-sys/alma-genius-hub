import { useState, useEffect } from "react";
import { QrCode, Wifi, Camera, Fingerprint, Barcode, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { QRScanner } from "./QRScanner";
import { BarcodeScanner } from "./BarcodeScanner";
import { BiometricScanner } from "./BiometricScanner";
import { StudentsList } from "./StudentsList";
import { attendanceService } from "@/services/attendance.service";
import { useAuth } from "@/hooks/useAuth";

export const AttendanceTracker = () => {
  const [checkInMethod, setCheckInMethod] = useState<string>("");
  const [scannerType, setScannerType] = useState<'qr' | 'barcode' | 'facial' | 'fingerprint' | null>(null);
  const [showStudentsList, setShowStudentsList] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const handleCheckIn = async (method: string, scanData?: string) => {
    try {
      if (user) {
        const checkInMethod = method.toLowerCase().replace(' ', '_') as any;
        await attendanceService.markAttendance(user.id, 'present', checkInMethod);
        
        setCheckInMethod(method);
        toast({
          title: "Check-in Successful",
          description: `You've been marked present using ${method}${scanData ? ` (${scanData})` : ''}`
        });
      }
    } catch (error) {
      toast({
        title: "Check-in Failed",
        description: "Unable to mark attendance. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleScannerOpen = (type: 'qr' | 'barcode' | 'facial' | 'fingerprint') => {
    setScannerType(type);
  };

  const handleScanComplete = (data: string) => {
    const methodMap = {
      'qr': 'QR Code',
      'barcode': 'Barcode',
      'facial': 'Facial Recognition',
      'fingerprint': 'Fingerprint'
    };
    handleCheckIn(methodMap[scannerType!], data);
    setScannerType(null);
  };

  const isTeacherOrAdmin = profile?.role === 'teacher' || profile?.role === 'admin';
  return <div className="p-6 space-y-6 animate-slide-in">
      <div>
        <h2 className="text-3xl font-bold">Attendance Tracking</h2>
        <p className="text-muted-foreground">Mark your attendance for today's classes</p>
      </div>

      <Tabs defaultValue="checkin" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="checkin">Check In</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          {isTeacherOrAdmin && <TabsTrigger value="students">Students</TabsTrigger>}
        </TabsList>

        <TabsContent value="checkin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Check-in Method</CardTitle>
              <CardDescription>Choose how you want to mark your attendance</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Button 
                variant="outline" 
                className="h-32 flex-col gap-2 hover:border-primary hover:bg-primary/5" 
                onClick={() => handleScannerOpen('qr')}
              >
                <QrCode className="h-8 w-8 text-primary" />
                <span>QR Code Scanner</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-32 flex-col gap-2 hover:border-secondary hover:bg-secondary/5" 
                onClick={() => handleScannerOpen('barcode')}
              >
                <Barcode className="h-8 w-8 text-secondary" />
                <span>Barcode Scanner</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-32 flex-col gap-2 hover:border-accent hover:bg-accent/5" 
                onClick={() => handleScannerOpen('facial')}
              >
                <Camera className="h-8 w-8 text-accent" />
                <span>Facial Recognition</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-32 flex-col gap-2 hover:border-purple-500 hover:bg-purple-500/5" 
                onClick={() => handleScannerOpen('fingerprint')}
              >
                <Fingerprint className="h-8 w-8 text-purple-500" />
                <span>Fingerprint</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-32 flex-col gap-2 hover:border-blue-500 hover:bg-blue-500/5" 
                onClick={() => handleCheckIn("Wi-Fi Proximity")}
              >
                <Wifi className="h-8 w-8 text-blue-500" />
                <span>Wi-Fi Proximity</span>
              </Button>
              
              {isTeacherOrAdmin && (
                <Button 
                  variant="outline" 
                  className="h-32 flex-col gap-2 hover:border-green-500 hover:bg-green-500/5" 
                  onClick={() => setShowStudentsList(true)}
                >
                  <Users className="h-8 w-8 text-green-500" />
                  <span>Students List</span>
                </Button>
              )}
            </CardContent>
          </Card>

          {checkInMethod && <Card className="animate-scale-in">
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
            </Card>}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Your attendance record for this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[{
                date: "March 15, 2024",
                status: "present",
                classes: 5
              }, {
                date: "March 14, 2024",
                status: "present",
                classes: 4
              }, {
                date: "March 13, 2024",
                status: "absent",
                classes: 5
              }, {
                date: "March 12, 2024",
                status: "present",
                classes: 5
              }, {
                date: "March 11, 2024",
                status: "late",
                classes: 5
              }].map((record, index) => <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{record.date}</p>
                      <p className="text-sm text-muted-foreground">{record.classes} classes</p>
                    </div>
                    <Badge variant={record.status === "present" ? "default" : record.status === "absent" ? "destructive" : "secondary"}>
                      {record.status}
                    </Badge>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isTeacherOrAdmin && (
          <TabsContent value="students">
            <StudentsList />
          </TabsContent>
        )}
      </Tabs>

      {/* Scanner Dialogs */}
      <Dialog open={scannerType === 'qr'} onOpenChange={(open) => !open && setScannerType(null)}>
        <DialogContent className="max-w-3xl">
          <QRScanner 
            onScan={handleScanComplete} 
            onClose={() => setScannerType(null)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={scannerType === 'barcode'} onOpenChange={(open) => !open && setScannerType(null)}>
        <DialogContent className="max-w-3xl">
          <BarcodeScanner 
            onScan={handleScanComplete} 
            onClose={() => setScannerType(null)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={scannerType === 'facial' || scannerType === 'fingerprint'} onOpenChange={(open) => !open && setScannerType(null)}>
        <DialogContent className="max-w-3xl">
          <BiometricScanner 
            type={scannerType as 'facial' | 'fingerprint'} 
            onScan={handleScanComplete} 
            onClose={() => setScannerType(null)} 
          />
        </DialogContent>
      </Dialog>

      {/* Students List Dialog for Quick Access */}
      <Dialog open={showStudentsList} onOpenChange={setShowStudentsList}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <StudentsList />
        </DialogContent>
      </Dialog>
    </div>;
};