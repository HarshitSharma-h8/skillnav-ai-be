import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
  Compass,
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
} from "lucide-react";

export function CareerGuidance() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          AI Career Guidance
        </h1>
        <p className="text-slate-500 mt-2">
          Discover personalized career paths based on your skills, interests,
          and market demand.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-blue-100 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <CardTitle>AI Career Assessment</CardTitle>
            </div>
            <CardDescription>
              Take a 5-minute assessment to get personalized career
              recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Our AI analyzes your current skills, educational background, and
                interests against live job market data to suggest the most
                viable and rewarding career paths for you.
              </p>
              <Button className="w-full sm:w-auto">
                Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Trajectory</CardTitle>
            <CardDescription>Based on your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium">Frontend Developer</p>
                  <p className="text-xs text-slate-500">70% Match</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium">Full Stack Developer</p>
                  <p className="text-xs text-slate-500">
                    45% Match (Needs Upskilling)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-semibold tracking-tight mt-12 mb-6">
        Recommended Career Paths
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">
                  Cloud Solutions Architect
                </CardTitle>
                <CardDescription className="mt-1">
                  High Demand • High Growth
                </CardDescription>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                92% Match
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Leverage your existing programming skills and transition into
              cloud architecture. This role involves designing and deploying
              scalable applications on cloud platforms like AWS or Azure.
            </p>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Key Skills Needed:</h4>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  AWS/Azure
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  System Design
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  Networking
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  Security
                </span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="w-full">
                View Roadmap
              </Button>
              <Button className="w-full">Explore Jobs</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Data Engineer</CardTitle>
                <CardDescription className="mt-1">
                  Very High Demand • Steady Growth
                </CardDescription>
              </div>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                85% Match
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Build systems that collect, manage, and convert raw data into
              usable information for data scientists and business analysts.
              Strong SQL and Python skills are a great foundation.
            </p>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Key Skills Needed:</h4>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  Python
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  SQL
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  ETL Pipelines
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  Big Data
                </span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="w-full">
                View Roadmap
              </Button>
              <Button className="w-full">Explore Jobs</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
