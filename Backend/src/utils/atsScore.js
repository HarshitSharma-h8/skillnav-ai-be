/* ---------------- helpers ---------------- */

export function normalizeText(t = "") {
  return (t || "")
    .replace(/\r/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/[•●▪︎■◆►▶]/g, "- ")
    .replace(/\u00A0/g, " ")
    .trim();
}

export function countOccurrences(text, regex) {
  const m = normalizeText(text).match(regex);
  return m ? m.length : 0;
}

export function extractEmail(text) {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0] : null;
}

export function extractPhone(text) {
  const m = text.replace(/\s/g, "").match(/(\+?\d{1,3})?[-.]?\d{10}/);
  return m ? m[0] : null;
}

export function extractLinks(text) {
  return Array.from(new Set((text.match(/https?:\/\/[^\s)]+/g) || [])));
}

export function keywordCoverage(resumeText, targetKeywords = []) {
  const t = normalizeText(resumeText).toLowerCase();
  const found = [];
  const missing = [];

  for (const kwRaw of targetKeywords) {
    const kw = (kwRaw || "").trim().toLowerCase();
    if (!kw) continue;
    if (t.includes(kw)) found.push(kwRaw);
    else missing.push(kwRaw);
  }

  const total = found.length + missing.length;
  const ratio = total === 0 ? 0 : found.length / total;

  return { found, missing, ratio };
}

export function hasSection(text, names) {
  const t = normalizeText(text).toLowerCase();
  return names.some(n => t.includes(n));
}

export function scoreResume({ resumeText, targetKeywords = [], jobTitle = "" }) {
  const text = normalizeText(resumeText);
  const lower = text.toLowerCase();

  const hasEmail = !!extractEmail(text);
  const hasPhone = !!extractPhone(text);
  const links = extractLinks(text);
  const hasLinkedIn = links.some(l => l.toLowerCase().includes("linkedin.com"));
  const hasGitHub = links.some(l => l.toLowerCase().includes("github.com"));

  const sections = {
    summary: hasSection(text, ["summary", "professional summary", "profile"]),
    experience: hasSection(text, ["experience", "work experience", "employment"]),
    education: hasSection(text, ["education", "academics"]),
    skills: hasSection(text, ["skills", "technical skills", "key skills"]),
    projects: hasSection(text, ["projects", "project experience"]),
    certifications: hasSection(text, ["certifications", "certification", "courses"]),
  };

  const metricsCount =
    countOccurrences(text, /\b\d{1,3}%\b/g) +
    countOccurrences(text, /\b\d+(\.\d+)?\b/g);

  const bulletCount = countOccurrences(text, /^\s*-\s+/gm);

  const hasTablesHint = /(\|.+\|)|(\t{2,})/.test(text);

  const coverage = keywordCoverage(text, targetKeywords);

  const weights = { contact: 10, sections: 25, keywords: 35, impact: 15, formatting: 15 };

  let contactScore = 0;
  if (hasEmail) contactScore += 4;
  if (hasPhone) contactScore += 4;
  if (hasLinkedIn || hasGitHub) contactScore += 2;
  contactScore = Math.min(contactScore, weights.contact);

  let sectionsScore = 0;
  const core = ["summary", "experience", "education", "skills"];
  for (const k of core) if (sections[k]) sectionsScore += 5;
  if (sections.projects) sectionsScore += 3;
  if (sections.certifications) sectionsScore += 2;
  sectionsScore = Math.min(sectionsScore, weights.sections);

  let keywordsScore = Math.round(coverage.ratio * weights.keywords);
  if (jobTitle && lower.includes(jobTitle.toLowerCase())) {
    keywordsScore = Math.min(weights.keywords, keywordsScore + 2);
  }

  let impactScore = 3;
  if (metricsCount >= 25) impactScore = 15;
  else if (metricsCount >= 15) impactScore = 12;
  else if (metricsCount >= 8) impactScore = 9;
  else if (metricsCount >= 3) impactScore = 6;

  let formattingScore = 0;
  if (bulletCount >= 10) formattingScore += 6;
  else if (bulletCount >= 5) formattingScore += 4;
  else formattingScore += 2;

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 250 && wordCount <= 900) formattingScore += 6;
  else if (wordCount >= 150 && wordCount <= 1200) formattingScore += 4;
  else formattingScore += 2;

  if (hasTablesHint) formattingScore -= 2;
  formattingScore = Math.max(0, Math.min(formattingScore, weights.formatting));

  const raw = contactScore + sectionsScore + keywordsScore + impactScore + formattingScore;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  const tips = [];
  if (!hasEmail) tips.push("Add a professional email in header.");
  if (!hasPhone) tips.push("Add a phone number in header.");
  if (!sections.summary) tips.push("Add a 2–3 line Summary tailored to the target role.");
  if (!sections.skills) tips.push("Add a dedicated Skills section with relevant keywords.");
  if (!sections.experience && !sections.projects) tips.push("Add Experience or Projects with bullet points.");
  if (metricsCount < 5) tips.push("Add measurable impact (numbers/%, scale, time saved, etc.).");
  if (bulletCount < 5) tips.push("Use more bullet points (ATS reads bullets cleanly).");
  if (coverage.missing.length > 0) {
    tips.push(
      `Add missing keywords (only if true): ${coverage.missing.slice(0, 12).join(", ")}${
        coverage.missing.length > 12 ? "..." : ""
      }`
    );
  }
  if (hasTablesHint) tips.push("Avoid tables/columns; use a single-column layout for ATS.");

  return {
    atsScore: score,
    breakdown: {
      contact: contactScore,
      sections: sectionsScore,
      keywords: keywordsScore,
      impact: impactScore,
      formatting: formattingScore,
    },
    stats: {
      wordCount,
      bulletCount,
      metricsCount,
      hasEmail,
      hasPhone,
      hasLinkedIn,
      hasGitHub,
      sections,
      keywords: {
        total: targetKeywords.length,
        found: coverage.found,
        missing: coverage.missing,
        coverageRatio: Number(coverage.ratio.toFixed(2)),
      },
    },
    tips: Array.from(new Set(tips)).slice(0, 12),
  };
}
