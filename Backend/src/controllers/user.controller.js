import User from "../models/User.model.js";
import mammoth from "mammoth";
import { scoreResume, normalizeText } from "../utils/atsScore.js";
import { PDFParse } from "pdf-parse";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

async function repairToJson(badText) {
  const fixPrompt = `
Convert the following into STRICT valid JSON that matches this schema exactly.
Return JSON ONLY. No markdown.

Schema:
{
  "aiScoreDelta": number,
  "missingKeywords": string[],
  "rewriteSummary": string,
  "bulletImprovements": string[],
  "topFixes": string[]
}

Text to convert:
${badText}
`;

  const r = await openrouter.chat.completions.create({
    model: "google/gemini-2.0-flash-lite-001",
    messages: [{ role: "user", content: fixPrompt }],
    temperature: 0,
    max_tokens: 600,
  });

  return r?.choices?.[0]?.message?.content || "";
}

/* ================================
   OPENROUTER SETUP
================================ */

const openrouter = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    })
  : null;

function shouldFallbackAI(err) {
  const status =
    err?.status ||
    err?.response?.status ||
    err?.response?.statusCode ||
    err?.statusCode;

  const msg = String(err?.message || "").toLowerCase();

  if ([401, 403, 429].includes(status)) return true;

  if (
    msg.includes("api key") ||
    msg.includes("permission") ||
    msg.includes("unauthorized") ||
    msg.includes("quota") ||
    msg.includes("rate") ||
    msg.includes("billing")
  ) {
    return true;
  }

  return false;
}

function safeJsonParse(s) {
  try {
    const raw = String(s || "");
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

/* ================================
   AI RESUME INSIGHTS (OpenRouter)
================================ */

async function aiResumeInsights({ resumeText, jobTitle, targetKeywords }) {
  if (!openrouter)
    return { used: false, reason: "OPENROUTER_API_KEY not set" };

  const clipped =
    resumeText.length > 12000
      ? resumeText.slice(0, 12000)
      : resumeText;

  const prompt = `
You are an ATS resume reviewer.
Return STRICT JSON ONLY (no markdown).
Schema:
{
  "aiScoreDelta": number,
  "missingKeywords": string[],
  "rewriteSummary": string,
  "bulletImprovements": string[],
  "topFixes": string[]
}

Job title: ${jobTitle || ""}
Target keywords: ${JSON.stringify(targetKeywords || [])}

Resume text:
${clipped}
`;

  const response = await openrouter.chat.completions.create({
    model: "stepfun/step-3.5-flash:free",
    messages: [
      { role: "system", content: "You are a strict JSON generator." },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 800,
  });

  const text = response?.choices?.[0]?.message?.content || "";
let json = safeJsonParse(text);

if (!json) {
  const repaired = await repairToJson(text);
  json = safeJsonParse(repaired);
}

if (!json) {
  return { used: false, reason: "AI output not valid JSON" };
}

return { used: true, data: json };
}

/* ================================
   CONTROLLERS
================================ */

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const allowed = [
      "name",
      "location",
      "targetRole",
      "skills",
      "education",
      "experienceYears",
    ];

    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.skills) {
      if (!Array.isArray(updates.skills)) {
        return res
          .status(400)
          .json({ message: "skills must be an array of strings" });
      }
      updates.skills = [
        ...new Set(
          updates.skills.map((s) => String(s).trim()).filter(Boolean)
        ),
      ];
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    ).select("-passwordHash");

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function addSkills(req, res) {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: "skills must be an array" });
    }

    const cleaned = skills
      .map((s) => String(s).trim())
      .filter(Boolean);

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { skills: { $each: cleaned } } },
      { new: true }
    ).select("-passwordHash");

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function removeSkill(req, res) {
  try {
    const skill = String(req.params.skill || "").trim();
    if (!skill)
      return res.status(400).json({ message: "skill is required" });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { skills: skill } },
      { new: true }
    ).select("-passwordHash");

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function analyzeResume(req, res) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Resume file is required (field name: resume)" });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res
        .status(400)
        .json({ message: "Only PDF or DOCX allowed" });
    }

    let resumeText = "";

    if (req.file.mimetype === "application/pdf") {
      const parser = new PDFParse({ data: req.file.buffer });
      const result = await parser.getText();
      await parser.destroy();
      resumeText = result?.text || "";
    } else {
      const out = await mammoth.extractRawText({
        buffer: req.file.buffer,
      });
      resumeText = out?.value || "";
    }

    resumeText = normalizeText(resumeText);

    if (resumeText.length < 50) {
      return res.status(400).json({
        message:
          "Could not read enough text from resume.",
      });
    }

    const user = req.userId
      ? await User.findById(req.userId).select(
          "skills targetRole"
        )
      : null;

    const userSkills = Array.isArray(user?.skills)
      ? user.skills
      : [];

    const userTargetRole = user?.targetRole || "";

    const extraKeywords = String(req.body.keywords || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const targetKeywords = Array.from(
      new Set([...userSkills, ...extraKeywords])
    );

    const jobTitle = String(
      req.body.jobTitle || userTargetRole || ""
    ).trim();

    const baseline = scoreResume({
      resumeText,
      targetKeywords,
      jobTitle,
    });

    let ai = { used: false, reason: "not_attempted" };

    try {
      ai = await aiResumeInsights({
        resumeText,
        jobTitle,
        targetKeywords,
      });
    } catch (err) {
      console.error("AI ERROR:", err);

      if (shouldFallbackAI(err)) {
        ai = {
          used: false,
          reason: err?.message || "ai_unavailable",
        };
      } else {
        ai = {
          used: false,
          reason: err?.message || "ai_error",
        };
      }
    }

    return res.json({
      ok: true,
      jobTitle,
      ...baseline,
      ai: ai.used
        ? { used: true, ...ai.data }
        : { used: false, reason: ai.reason },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
}

