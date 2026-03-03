import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Target, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface Skill {
  id: number;
  name: string;
  current_level: number;
  required_level: number;
}

export function SkillGap() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    fetch("/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setSkills(data.skills);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch skill data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading skill gap analysis...</div>;
  }

  const data = skills.map(s => ({
    subject: s.name,
    A: s.current_level,
    B: s.required_level,
    fullMark: 100
  }));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Skill Gap Analysis</h1>
        <p className="text-slate-500 mt-2">Compare your current skills against industry requirements for your target role.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Skill Proficiency Radar</CardTitle>
            <CardDescription>Your profile vs Full Stack Developer requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="Your Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                  <Radar name="Required" dataKey="B" stroke="#cbd5e1" fill="#cbd5e1" fillOpacity={0.3} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 opacity-50"></div>
                <span>Your Skills</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-400 opacity-30"></div>
                <span>Required</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personalized Learning Roadmap</CardTitle>
            <CardDescription>Step-by-step guide to bridge your skill gaps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="relative pl-6 border-l-2 border-blue-600">
                <div className="absolute -left-[9px] top-0 bg-white">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Phase 1: Advanced Frontend</h4>
                <p className="text-sm text-slate-500 mt-1">Master React hooks, state management, and performance optimization.</p>
                <div className="mt-2 text-xs font-medium text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">Completed</div>
              </div>

              <div className="relative pl-6 border-l-2 border-slate-200">
                <div className="absolute -left-[9px] top-0 bg-white">
                  <Circle className="h-4 w-4 text-blue-600 fill-blue-600" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Phase 2: Backend Fundamentals</h4>
                <p className="text-sm text-slate-500 mt-1">Learn Node.js, Express, and RESTful API design principles.</p>
                <div className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 inline-block px-2 py-1 rounded">In Progress (60%)</div>
                <Button size="sm" variant="outline" className="mt-3 w-full">Continue Course</Button>
              </div>

              <div className="relative pl-6 border-l-2 border-slate-200">
                <div className="absolute -left-[9px] top-0 bg-white">
                  <Circle className="h-4 w-4 text-slate-300" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Phase 3: Database Mastery</h4>
                <p className="text-sm text-slate-500 mt-1">Deep dive into SQL, indexing, and NoSQL databases like MongoDB.</p>
                <div className="mt-2 text-xs font-medium text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded">Not Started</div>
                <Button size="sm" variant="outline" className="mt-3 w-full">View Recommended Courses</Button>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-0 bg-white">
                  <Circle className="h-4 w-4 text-slate-300" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Phase 4: DevOps & Deployment</h4>
                <p className="text-sm text-slate-500 mt-1">Learn Docker, CI/CD pipelines, and basic AWS services.</p>
                <div className="mt-2 text-xs font-medium text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded">Not Started</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
