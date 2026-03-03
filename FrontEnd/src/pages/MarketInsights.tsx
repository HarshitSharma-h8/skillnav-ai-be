import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Briefcase, MapPin } from "lucide-react";

interface InsightData {
  id: number;
  month: string;
  tech_roles: number;
  non_tech_roles: number;
  vocational_roles: number;
}

export function MarketInsights() {
  const [demandData, setDemandData] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    fetch("/api/market-insights", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setDemandData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch market insights:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading market insights...</div>;
  }

  const chartData = demandData.map(d => ({
    month: d.month,
    tech: d.tech_roles,
    nonTech: d.non_tech_roles,
    vocational: d.vocational_roles
  }));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Job Market Insights</h1>
        <p className="text-slate-500 mt-2">Live data mapping workforce skills to industry demand across regions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Openings</CardTitle>
            <Briefcase className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124,500+</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Skill Demand</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Cloud Computing</div>
            <p className="text-xs text-slate-500 mt-1">AWS, Azure, GCP</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Job Seekers</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84,200</div>
            <p className="text-xs text-slate-500 mt-1">Registered on platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Region</CardTitle>
            <MapPin className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bengaluru</div>
            <p className="text-xs text-slate-500 mt-1">32% of total tech jobs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Industry Demand Trends</CardTitle>
          <CardDescription>6-month forecast based on live labor market data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNonTech" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVocational" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="tech" name="Tech Roles" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTech)" />
                <Area type="monotone" dataKey="nonTech" name="Non-Tech Roles" stroke="#10b981" fillOpacity={1} fill="url(#colorNonTech)" />
                <Area type="monotone" dataKey="vocational" name="Vocational Roles" stroke="#f59e0b" fillOpacity={1} fill="url(#colorVocational)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Tech Roles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Non-Tech Roles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Vocational Roles</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
