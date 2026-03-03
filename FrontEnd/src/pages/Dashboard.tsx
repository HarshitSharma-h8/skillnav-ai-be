import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ArrowRight, BookOpen, Briefcase, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface User {
  id: number;
  name: string;
  role: string;
  profile_score: number;
}

interface Skill {
  id: number;
  name: string;
  current_level: number;
  required_level: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    fetch("/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setSkills(data.skills);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading dashboard...</div>;
  }

  const skillData = skills.map(s => ({
    name: s.name,
    current: s.current_level,
    required: s.required_level
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, {user?.name.split(' ')[0]}!</h1>
        <p className="text-slate-500 mt-2">Here's an overview of your skill development and career progress.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Score</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.profile_score}%</div>
            <p className="text-xs text-slate-500">+4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-slate-500">2 pending completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Matches</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-slate-500">Based on current skills</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Demand</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">High</div>
            <p className="text-xs text-slate-500">For Full Stack Developers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Skill Gap Overview</CardTitle>
            <CardDescription>Your current proficiency vs market requirements for your target role.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="current" name="Your Skill Level" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="required" name="Required Level" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>AI-suggested next steps to improve employability.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Complete AWS Cloud Practitioner</p>
                  <p className="text-sm text-slate-500">High impact on job matches</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/training")}>
                  Start
                </Button>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Update Resume</p>
                  <p className="text-sm text-slate-500">Missing recent React projects</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/resume")}>
                  Analyze
                </Button>
              </div>
              <div className="flex items-center justify-between pb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Explore Market Insights</p>
                  <p className="text-sm text-slate-500">See trending skills in your region</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/market")}>
                  View
                </Button>
              </div>
            </div>
            <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-700">
              View All Recommendations <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
