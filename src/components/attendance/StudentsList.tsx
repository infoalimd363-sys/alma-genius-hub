import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { attendanceService } from "@/services/attendance.service";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  profile_pic?: string;
  aadhaar_number?: string;
  attendance?: {
    status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
    check_in_time?: string;
  };
}

export const StudentsList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name');

      if (selectedClass !== 'all') {
        query = query.eq('class_id', selectedClass);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch today's attendance for all students
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', today);

      // Map attendance to students
      const studentsWithAttendance = data?.map(student => {
        const todayAttendance = attendanceData?.find(a => a.user_id === student.id);
        return {
          ...student,
          attendance: todayAttendance ? {
            status: todayAttendance.status,
            check_in_time: todayAttendance.check_in_time
          } : undefined
        };
      }) || [];

      setStudents(studentsWithAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students list",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    try {
      await attendanceService.markAttendance(studentId, status, 'manual');
      
      // Update local state
      setStudents(prev => prev.map(student => 
        student.id === studentId 
          ? { ...student, attendance: { status, check_in_time: new Date().toISOString() } }
          : student
      ));

      toast({
        title: "Success",
        description: `Attendance marked as ${status}`,
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive"
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'excused':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-500 text-white">Present</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'late':
        return <Badge className="bg-yellow-500 text-white">Late</Badge>;
      case 'excused':
        return <Badge className="bg-blue-500 text-white">Excused</Badge>;
      default:
        return <Badge variant="outline">Not Marked</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Students List
        </CardTitle>
        <CardDescription>
          Mark attendance for all students in the class
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="class-a">Class A</SelectItem>
              <SelectItem value="class-b">Class B</SelectItem>
              <SelectItem value="class-c">Class C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading students...</div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.profile_pic} />
                          <AvatarFallback>
                            {student.full_name?.split(' ').map(n => n[0]).join('') || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.student_id || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(student.attendance?.status)}
                        {getStatusBadge(student.attendance?.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.attendance?.check_in_time 
                        ? new Date(student.attendance.check_in_time).toLocaleTimeString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={student.attendance?.status === 'present' ? 'default' : 'outline'}
                          onClick={() => markAttendance(student.id, 'present')}
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={student.attendance?.status === 'absent' ? 'destructive' : 'outline'}
                          onClick={() => markAttendance(student.id, 'absent')}
                        >
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          variant={student.attendance?.status === 'late' ? 'secondary' : 'outline'}
                          onClick={() => markAttendance(student.id, 'late')}
                        >
                          Late
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <p>Total Students: {filteredStudents.length}</p>
          <div className="flex gap-4">
            <span>Present: {filteredStudents.filter(s => s.attendance?.status === 'present').length}</span>
            <span>Absent: {filteredStudents.filter(s => s.attendance?.status === 'absent').length}</span>
            <span>Late: {filteredStudents.filter(s => s.attendance?.status === 'late').length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};