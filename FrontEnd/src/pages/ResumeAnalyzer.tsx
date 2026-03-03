import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, Loader2 } from "lucide-react";

interface AnalysisResult {
  atsScore: number;
  strengths: string[];
  improvements: string[];
}

export function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume text first.");
      return;
    }

    setAnalyzing(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ resumeText }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Failed to analyze resume");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while analyzing the resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Resume Analyzer</h1>
        <p className="text-slate-500 mt-2">Paste your resume text to get instant feedback and AI-driven improvement suggestions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-slate-300 flex flex-col p-6 h-[400px]">
          <h3 className="font-semibold text-lg mb-2">Resume Content</h3>
          <p className="text-sm text-slate-500 mb-4">Paste the text content of your resume below.</p>
          <textarea 
            className="flex-1 w-full resize-none rounded-md border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
            placeholder="Sumit Kapoor\nFull Stack Developer\n\nExperience:\n- Built scalable web apps..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          <Button onClick={handleAnalyze} disabled={analyzing} className="w-full">
            {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Analyze Resume"}
          </Button>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </Card>

        <Card className="md:col-span-2 min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                {result ? "Based on your provided text" : "Awaiting your resume text"}
              </CardDescription>
            </div>
            {result && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">ATS Score</span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${
                  result.atsScore >= 80 ? 'bg-green-100 text-green-700' : 
                  result.atsScore >= 60 ? 'bg-amber-100 text-amber-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  {result.atsScore}/100
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className="mt-4">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <FileText className="h-16 w-16 mb-4 opacity-20" />
                <p>Paste your resume and click Analyze to see results here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" /> Strengths
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600 pl-7">
                    {result.strengths.map((strength, i) => (
                      <li key={i}>• {strength}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" /> Areas for Improvement
                  </h4>
                  <ul className="space-y-3 text-sm text-slate-600 pl-7">
                    {result.improvements.map((improvement, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-slate-900">• {improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button className="w-full gap-2" variant="outline">
                    <Sparkles className="h-4 w-4" /> Generate AI Improved Resume
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
