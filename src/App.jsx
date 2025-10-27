import { useMemo, useState } from "react";
import Header from "./components/Header";
import JDForm from "./components/JDForm";
import ResumeDropzone from "./components/ResumeDropzone";
import CandidateResults from "./components/CandidateResults";

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+.# ]/g, " ")
    .split(/\s+/)
    .filter((w) => w && w.length > 2);
}

function uniqueKeywords(text) {
  const common = new Set([
    "and",
    "the",
    "with",
    "for",
    "you",
    "are",
    "our",
    "this",
    "that",
    "from",
    "your",
    "will",
    "have",
  ]);
  const set = new Set(tokenize(text).filter((w) => !common.has(w)));
  return Array.from(set);
}

function extractYears(text) {
  // Simple heuristic: find patterns like "X years"
  const matches = Array.from(text.matchAll(/(\d{1,2})\s+years?/gi));
  const years = matches.map((m) => parseInt(m[1], 10)).filter((n) => !isNaN(n));
  if (years.length) return Math.max(...years);
  // fallback: senior keywords
  if (/senior|lead|principal|staff/i.test(text)) return 7;
  if (/mid|intermediate/i.test(text)) return 4;
  if (/junior|entry/i.test(text)) return 1;
  return 0;
}

function inferSeniority(text) {
  if (/principal|staff|lead|manager|architect/i.test(text)) return "Senior";
  if (/senior/i.test(text)) return "Senior";
  if (/mid|intermediate/i.test(text)) return "Mid";
  if (/junior|entry/i.test(text)) return "Junior";
  return "Unknown";
}

function scoreCandidate(jd, candidate) {
  const jdKeywords = uniqueKeywords(jd);
  const resumeTokens = tokenize(candidate.rawText || "");
  const resumeSet = new Set(resumeTokens);

  const matched = jdKeywords.filter((k) => resumeSet.has(k));
  const skillMatch = jdKeywords.length
    ? Math.round((matched.length / jdKeywords.length) * 100)
    : 0;

  const years = extractYears(candidate.rawText || "");
  const seniority = inferSeniority(candidate.rawText || "");

  // Overall score weighted by skill match (70%) + experience (20%) + seniority (10%)
  const seniorityScore =
    seniority === "Senior" ? 100 : seniority === "Mid" ? 60 : seniority === "Junior" ? 30 : 40;
  const expScore = Math.min(100, Math.round((years / 12) * 100)); // caps at 12 years
  const overall = Math.round(skillMatch * 0.7 + expScore * 0.2 + seniorityScore * 0.1);

  return {
    ...candidate,
    scores: {
      skillMatch,
      years,
      seniority,
      overall,
      topSkills: matched.sort((a, b) => a.localeCompare(b)),
    },
  };
}

export default function App() {
  const [jd, setJd] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [scored, setScored] = useState([]);

  const canScore = useMemo(() => jd.trim().length > 0 && candidates.length > 0, [jd, candidates]);

  const handleAdded = (newOnes) => {
    setCandidates((prev) => {
      const map = new Map(prev.map((c) => [c.id, c]));
      for (const c of newOnes) map.set(c.id, c);
      return Array.from(map.values());
    });
  };

  const runScoring = () => {
    const res = candidates.map((c) => scoreCandidate(jd, c));
    // Sort by overall desc
    res.sort((a, b) => (b.scores?.overall || 0) - (a.scores?.overall || 0));
    setScored(res);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-900">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JDForm value={jd} onChange={setJd} onScore={runScoring} disabled={!canScore} />
          <ResumeDropzone onCandidatesAdded={handleAdded} />
        </div>

        <CandidateResults candidates={scored} />

        <div className="text-xs text-neutral-500 max-w-3xl">
          Note: This interface runs fully in your browser for the demo. To use your OpenRouter key, PDF parsing, and a database like Postgres for storage, the next step is to hook this UI to a backend service with endpoints for parsing, scoring via LLM, and saving results.
        </div>
      </main>
    </div>
  );
}
