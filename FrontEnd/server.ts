import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";
import jwt from "jsonwebtoken";

const db = new Database("skillnav.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE,
    name TEXT,
    picture TEXT,
    role TEXT,
    profile_score INTEGER
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    current_level INTEGER,
    required_level INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    category TEXT,
    description TEXT,
    duration TEXT,
    lessons INTEGER,
    rating REAL
  );

  CREATE TABLE IF NOT EXISTS market_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT,
    tech_roles INTEGER,
    non_tech_roles INTEGER,
    vocational_roles INTEGER
  );
`);

// Seed Initial Data for Courses and Market Insights
const courseCount = db.prepare("SELECT COUNT(*) as count FROM courses").get() as { count: number };
if (courseCount.count === 0) {
  const insertCourse = db.prepare("INSERT INTO courses (title, category, description, duration, lessons, rating) VALUES (?, ?, ?, ?, ?, ?)");
  const insertMarket = db.prepare("INSERT INTO market_insights (month, tech_roles, non_tech_roles, vocational_roles) VALUES (?, ?, ?, ?)");

  db.transaction(() => {
    insertCourse.run("Advanced React Patterns", "Technical", "Master complex state management, performance optimization, and custom hooks.", "12 Hours", 24, 4.8);
    insertCourse.run("Digital Tools for Small Business", "Vocational", "Learn how to manage customers, track inventory, and use digital payment systems effectively.", "8 Hours", 15, 4.9);
    insertCourse.run("Effective Communication", "Soft Skills", "Improve workplace communication, conflict resolution, and presentation skills.", "5 Hours", 10, 4.7);

    insertMarket.run("Jan", 4000, 2400, 2400);
    insertMarket.run("Feb", 3000, 1398, 2210);
    insertMarket.run("Mar", 2000, 9800, 2290);
    insertMarket.run("Apr", 2780, 3908, 2000);
    insertMarket.run("May", 1890, 4800, 2181);
    insertMarket.run("Jun", 2390, 3800, 2500);
    insertMarket.run("Jul", 3490, 4300, 2100);
  })();
}

function seedUserSkills(userId: number) {
  const insertSkill = db.prepare("INSERT INTO skills (user_id, name, current_level, required_level) VALUES (?, ?, ?, ?)");
  insertSkill.run(userId, "React", 80, 90);
  insertSkill.run(userId, "Node.js", 60, 85);
  insertSkill.run(userId, "Python", 40, 70);
  insertSkill.run(userId, "AWS", 30, 80);
  insertSkill.run(userId, "SQL", 75, 80);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_in_production";

// Authentication Middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
  
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    (req as any).userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // OAuth Routes
  app.get("/api/auth/google/url", (req, res) => {
    const redirectUri = req.query.redirectUri as string;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      return res.status(500).json({ error: "GOOGLE_CLIENT_ID is not configured in the environment variables." });
    }
    
    const state = Buffer.from(JSON.stringify({ redirectUri })).toString("base64");
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "email profile",
      access_type: "offline",
      prompt: "consent",
      state: state
    });
    
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  });

  app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).send("Missing code or state");
    }

    try {
      const { redirectUri } = JSON.parse(Buffer.from(state as string, "base64").toString("utf-8"));
      
      // Exchange code for token
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          code: code as string,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });
      
      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok) throw new Error(tokenData.error_description || "Failed to get token");

      // Get user info
      const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userData = await userResponse.json();

      // Upsert user in DB
      let user = db.prepare("SELECT * FROM users WHERE google_id = ?").get(userData.id) as any;
      
      if (!user) {
        const insert = db.prepare("INSERT INTO users (google_id, email, name, picture, role, profile_score) VALUES (?, ?, ?, ?, ?, ?)");
        const info = insert.run(userData.id, userData.email, userData.name, userData.picture, "Job Seeker", 72);
        user = { id: info.lastInsertRowid, name: userData.name, email: userData.email, picture: userData.picture };
        
        // Seed skills for new user
        seedUserSkills(user.id);
      } else {
        // Update existing user info
        db.prepare("UPDATE users SET name = ?, picture = ? WHERE id = ?").run(userData.name, userData.picture, user.id);
      }

      // Create JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${token}' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("OAuth error:", error);
      res.send(`<p>Authentication failed: ${error.message}</p>`);
    }
  });

  // API Routes
  app.get("/api/me", authenticate, (req, res) => {
    const userId = (req as any).userId;
    const user = db.prepare("SELECT id, name, email, picture, role, profile_score FROM users WHERE id = ?").get(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.get("/api/dashboard", authenticate, (req, res) => {
    const userId = (req as any).userId;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    const skills = db.prepare("SELECT * FROM skills WHERE user_id = ?").all(userId);
    res.json({ user, skills });
  });

  app.get("/api/courses", authenticate, (req, res) => {
    const courses = db.prepare("SELECT * FROM courses").all();
    res.json(courses);
  });

  app.get("/api/market-insights", authenticate, (req, res) => {
    const insights = db.prepare("SELECT * FROM market_insights").all();
    res.json(insights);
  });

  app.post("/api/analyze-resume", authenticate, async (req, res) => {
    try {
      const { resumeText } = req.body;
      if (!resumeText) {
        return res.status(400).json({ error: "Resume text is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(500).json({ error: "Please configure your Gemini API key in the AI Studio Secrets panel." });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        Analyze the following resume text and provide a JSON response with the following structure:
        {
          "atsScore": number (0-100),
          "strengths": [array of strings],
          "improvements": [array of strings]
        }
        
        Resume Text:
        ${resumeText}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response from Gemini");
      }

      const result = JSON.parse(resultText);
      res.json(result);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      res.status(500).json({ error: "Failed to analyze resume" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
