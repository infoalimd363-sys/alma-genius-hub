import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Award, BookOpen, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { gradesService } from "@/services/grades.service";
import { useAuth } from "@/hooks/useAuth";

interface Grade {
  id: string;
  subject: string;
  grade: string;
  obtained_marks: number;
  max_marks: number;
  exam_type: string;
  academic_year: string;
  semester: string;
  created_at: string;
}

interface GradeStats {
  averagePercentage: number;
  totalMarks: number;
  maxPossibleMarks: number;
  subjects: Record<string, {
    total: number;
    obtained: number;
    count: number;
  }>;
  totalGrades: number;
}

export const StudentGrades = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [stats, setStats] = useState<GradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchGrades();
  }, [user]);

  const fetchGrades = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [gradesData, statsData] = await Promise.all([
        gradesService.getStudentGrades(user.id),
        gradesService.getGradeStats(user.id)
      ]);
      
      setGrades(gradesData || []);
      setStats(statsData);
    } catch (error: any) {
      toast({
        title: "Error fetching grades",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeUpper = grade.toUpperCase();
    if (gradeUpper.startsWith('A')) return "success";
    if (gradeUpper.startsWith('B')) return "secondary";
    if (gradeUpper.startsWith('C')) return "warning";
    return "destructive";
  };

  const getPercentage = (obtained: number, max: number) => {
    return max > 0 ? ((obtained / max) * 100).toFixed(1) : "0";
  };

  const filteredGrades = grades.filter(grade => {
    const semesterMatch = selectedSemester === "all" || grade.semester === selectedSemester;
    const subjectMatch = selectedSubject === "all" || grade.subject === selectedSubject;
    return semesterMatch && subjectMatch;
  });

  const uniqueSubjects = [...new Set(grades.map(g => g.subject))];
  const uniqueSemesters = [...new Set(grades.map(g => g.semester).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-slide-in">
      <div>
        <h2 className="text-3xl font-bold">Academic Performance</h2>
        <p className="text-muted-foreground">Track your grades and academic progress</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averagePercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalGrades} total assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalMarks} / {stats?.maxPossibleMarks}
            </div>
            <Progress 
              value={(stats?.totalMarks || 0) / (stats?.maxPossibleMarks || 1) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Subject</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.subjects && Object.keys(stats.subjects).length > 0
                ? Object.entries(stats.subjects)
                    .sort((a, b) => (b[1].obtained / b[1].total) - (a[1].obtained / a[1].total))[0][0]
                : "N/A"}
            </div>
            <p className="text-xs text-success">
              {stats?.subjects && Object.keys(stats.subjects).length > 0
                ? `${((Object.entries(stats.subjects)
                    .sort((a, b) => (b[1].obtained / b[1].total) - (a[1].obtained / a[1].total))[0][1].obtained / 
                    Object.entries(stats.subjects)
                    .sort((a, b) => (b[1].obtained / b[1].total) - (a[1].obtained / a[1].total))[0][1].total) * 100).toFixed(1)}% average`
                : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5.2%</div>
            <p className="text-xs text-muted-foreground">
              Compared to last semester
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {uniqueSemesters.map(sem => (
              <SelectItem key={sem} value={sem}>{sem}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {uniqueSubjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grades Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">Grade List</TabsTrigger>
          <TabsTrigger value="subjects">By Subject</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
              <CardDescription>Your academic performance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredGrades.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No grades found for the selected criteria
                  </p>
                ) : (
                  filteredGrades.map((grade) => (
                    <div key={grade.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{grade.subject}</p>
                          <Badge variant="outline" className="text-xs">
                            {grade.exam_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{grade.semester}</span>
                          <span>{grade.academic_year}</span>
                          <span>{new Date(grade.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {grade.obtained_marks}/{grade.max_marks}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getPercentage(grade.obtained_marks, grade.max_marks)}%
                          </p>
                        </div>
                        <Badge variant={getGradeColor(grade.grade) as any}>
                          {grade.grade}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(stats?.subjects || {}).map(([subject, data]) => (
              <Card key={subject}>
                <CardHeader>
                  <CardTitle className="text-lg">{subject}</CardTitle>
                  <CardDescription>{data.count} assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Score</span>
                      <span className="font-bold">{data.obtained}/{data.total}</span>
                    </div>
                    <Progress 
                      value={(data.obtained / data.total) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average</span>
                      <Badge variant={
                        (data.obtained / data.total) * 100 >= 80 ? "success" as any :
                        (data.obtained / data.total) * 100 >= 60 ? "secondary" :
                        "destructive"
                      }>
                        {((data.obtained / data.total) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};