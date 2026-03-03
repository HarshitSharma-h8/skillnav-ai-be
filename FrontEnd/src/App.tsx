

import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { CareerGuidance } from "./pages/CareerGuidance";
import { SkillGap } from "./pages/SkillGap";
import { ResumeAnalyzer } from "./pages/ResumeAnalyzer";
import { TrainingHub } from "./pages/TrainingHub";
import { MarketInsights } from "./pages/MarketInsights";
import { Login } from "./pages/Login";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }, [token]);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="guidance" element={<CareerGuidance />} />
          <Route path="skill-gap" element={<SkillGap />} />
          <Route path="resume" element={<ResumeAnalyzer />} />
          <Route path="training" element={<TrainingHub />} />
          <Route path="market" element={<MarketInsights />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
