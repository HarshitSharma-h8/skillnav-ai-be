import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { BookOpen, GraduationCap, PlayCircle, Star, Clock, Wrench, MessageSquare } from "lucide-react";

interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  duration: string;
  lessons: number;
  rating: number;
}

export function TrainingHub() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    fetch("/api/courses", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch courses:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading courses...</div>;
  }

  const filteredCourses = filter === "All" ? courses : courses.filter(c => c.category === filter);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Technical": return <GraduationCap className="h-16 w-16 text-blue-500 opacity-50" />;
      case "Vocational": return <Wrench className="h-16 w-16 text-emerald-500 opacity-50" />;
      case "Soft Skills": return <MessageSquare className="h-16 w-16 text-purple-500 opacity-50" />;
      default: return <BookOpen className="h-16 w-16 text-slate-500 opacity-50" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Technical": return "bg-blue-100";
      case "Vocational": return "bg-emerald-100";
      case "Soft Skills": return "bg-purple-100";
      default: return "bg-slate-100";
    }
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case "Technical": return "bg-blue-50 text-blue-700";
      case "Vocational": return "bg-emerald-50 text-emerald-700";
      case "Soft Skills": return "bg-purple-50 text-purple-700";
      default: return "bg-slate-50 text-slate-700";
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Training Hub</h1>
        <p className="text-slate-500 mt-2">Access vocational and non-technical skill training solutions tailored to your goals.</p>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <Button variant={filter === "All" ? "default" : "outline"} onClick={() => setFilter("All")}>All Courses</Button>
        <Button variant={filter === "Technical" ? "default" : "outline"} onClick={() => setFilter("Technical")}>Technical Skills</Button>
        <Button variant={filter === "Vocational" ? "default" : "outline"} onClick={() => setFilter("Vocational")}>Vocational Training</Button>
        <Button variant={filter === "Soft Skills" ? "default" : "outline"} onClick={() => setFilter("Soft Skills")}>Soft Skills</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map(course => (
          <Card key={course.id} className="flex flex-col">
            <div className={`h-40 ${getCategoryColor(course.category)} rounded-t-xl flex items-center justify-center`}>
              {getCategoryIcon(course.category)}
            </div>
            <CardHeader className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeColor(course.category)}`}>
                  {course.category}
                </span>
                <div className="flex items-center text-sm text-slate-500">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" /> {course.rating}
                </div>
              </div>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</div>
                <div className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {course.lessons} Lessons</div>
              </div>
              <Button className="w-full gap-2"><PlayCircle className="h-4 w-4" /> Start Learning</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
