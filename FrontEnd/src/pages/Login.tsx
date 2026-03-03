import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Compass, Loader2 } from "lucide-react";

export function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const response = await fetch(`/api/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get auth URL");
      }
      
      const { url } = await response.json();
      
      const authWindow = window.open(
        url,
        "oauth_popup",
        "width=600,height=700"
      );

      if (!authWindow) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }
    } catch (err: any) {
      console.error("OAuth error:", err);
      setError(err.message || "An error occurred during login.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin is from AI Studio preview or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.token) {
        onLogin(event.data.token);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to SkillNav AI</CardTitle>
          <CardDescription>
            Sign in to access personalized career guidance and upskilling tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
              {error}
            </div>
          )}
          
          <Button 
            className="w-full h-12 text-base font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900" 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="text-center text-xs text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
