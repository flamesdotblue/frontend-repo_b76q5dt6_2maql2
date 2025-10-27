import { useMemo, useState } from "react";
import Header from "./components/Header";
import JDForm from "./components/JDForm";
import ResumeDropzone from "./components/ResumeDropzone";
import CandidateResults from "./components/CandidateResults";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

export default function App() {
  const [jd, setJd] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [scored, setScored] = useState([]);
  const [loading, setLoading] = useState({ parse: false, score: false, save: false });
  const [error, setError] = useState("");
  const canScore = useMemo(() => jd.trim().length > 0 && candidates.length > 0, [jd, candidates]);

  const handleCandidatesParsed = (newOnes) => {
    setCandidates((prev) => {
      const map = new Map(prev.map((c) => [c.id, c]));
      for (const c of newOnes) map.set(c.id, c);
      return Array.from(map.values());
    });
  };

  const runScoring = async () => {
    if (!canScore) return;
    setError("");
    setLoading((s) => ({ ...s, score: true }));
    try {
      // Call backend scoring if configured; otherwise do nothing (UI requires backend for PDFs etc.)
      if (!BACKEND_URL) {
        throw new Error("Backend URL is not configured. Set VITE_BACKEND_URL in your env.");
      }
      const payload = {
        job_description: jd,
        candidates: candidates.map((c) => ({ id: c.id, name: c.name, text: c.rawText || "" })),
      };
      const res = await fetch(`${BACKEND_URL}/api/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Scoring failed (${res.status})`);
      const data = await res.json();
      // Expect data.results array aligned to candidates by id/name
      const byId = new Map((data.results || []).map((r) => [r.id || r.name, r]));
      const merged = candidates.map((c) => {
        const r = byId.get(c.id) || byId.get(c.name) || {};
        return {
          ...c,
          scores: {
            skillMatch: r.scores?.skill_match ?? r.skill_match ?? 0,
            years: r.scores?.years ?? r.years ?? 0,
            seniority: r.scores?.seniority ?? r.seniority ?? "Unknown",
            overall: r.scores?.overall ?? r.overall ?? 0,
            topSkills: r.scores?.top_skills ?? r.top_skills ?? [],
          },
        };
      });
      merged.sort((a, b) => (b.scores?.overall || 0) - (a.scores?.overall || 0));
      setScored(merged);
    } catch (e) {
      setError(e.message || "Failed to score candidates");
      setScored([]);
    } finally {
      setLoading((s) => ({ ...s, score: false }));
    }
  };

  const saveResults = async () => {
    if (!BACKEND_URL || !scored.length || !jd.trim()) return;
    setError("");
    setLoading((s) => ({ ...s, save: true }));
    try {
      const payload = {
        job: { title: jd.split("\n")[0].slice(0, 120) || "Role", description: jd },
        candidates: scored.map((c) => ({ name: c.name, filename: c.filename || "", raw_text: c.rawText || "" })),
        scores: scored.map((c) => ({
          name: c.name,
          scores: {
            skill_match: c.scores?.skillMatch ?? 0,
            years: c.scores?.years ?? 0,
            seniority: c.scores?.seniority || "Unknown",
            overall: c.scores?.overall ?? 0,
            top_skills: c.scores?.topSkills || [],
          },
        })),
      };
      const res = await fetch(`${BACKEND_URL}/api/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await res.json();
      alert("Results saved to database.");
    } catch (e) {
      setError(e.message || "Failed to save results");
    } finally {
      setLoading((s) => ({ ...s, save: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-900">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JDForm value={jd} onChange={setJd} onScore={runScoring} disabled={!canScore || loading.score} />
          <ResumeDropzone onCandidatesAdded={handleCandidatesParsed} backendUrl={BACKEND_URL} loading={loading.parse} setLoading={(v)=>setLoading((s)=>({...s, parse:v}))} setError={setError} />
        </div>

        <CandidateResults candidates={scored} onSave={saveResults} canSave={!!(BACKEND_URL && scored.length)} saving={loading.save} />

        <div className="text-xs text-neutral-500 max-w-3xl">
          Backend URL: {BACKEND_URL || "not configured"}. Set VITE_BACKEND_URL to enable PDF/DOCX parsing, LLM scoring, and saving to DB.
        </div>
      </main>
    </div>
  );
}
