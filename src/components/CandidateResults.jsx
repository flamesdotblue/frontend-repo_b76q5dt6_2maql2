import { useMemo, useState } from "react";
import { Star, Filter, Download } from "lucide-react";

function toCSV(rows) {
  const headers = [
    "Name",
    "Filename",
    "Skill Match",
    "Experience (yrs)",
    "Seniority",
    "Overall",
  ];
  const body = rows.map((r) => [
    r.name,
    r.filename || "",
    r.scores?.skillMatch ?? "",
    r.scores?.years ?? "",
    r.scores?.seniority ?? "",
    r.scores?.overall ?? "",
  ]);
  const lines = [headers, ...body]
    .map((arr) => arr.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  return lines;
}

export default function CandidateResults({ candidates, onExport }) {
  const [minScore, setMinScore] = useState(0);

  const filtered = useMemo(() => {
    return (candidates || []).filter((c) => (c.scores?.overall ?? 0) >= minScore);
  }, [candidates, minScore]);

  const handleExport = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidate_scores.csv";
    a.click();
    URL.revokeObjectURL(url);
    onExport?.();
  };

  return (
    <section className="w-full">
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2 text-neutral-700">
            <Star size={18} />
            <h2 className="font-medium">Results</h2>
            <span className="text-xs text-neutral-500">{filtered.length} shown</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <Filter size={16} />
              <span>Min score</span>
              <input
                type="number"
                min={0}
                max={100}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value || 0))}
                className="w-20 rounded-lg border border-neutral-300 px-2 py-1 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={!filtered.length}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Candidate</th>
                <th className="px-4 py-3 text-left font-medium">Skill match</th>
                <th className="px-4 py-3 text-left font-medium">Experience</th>
                <th className="px-4 py-3 text-left font-medium">Seniority</th>
                <th className="px-4 py-3 text-left font-medium">Overall</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-neutral-500">
                    No candidates to display. Upload resumes and run scoring.
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-neutral-100 hover:bg-neutral-50/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-800">{c.name}</div>
                    <div className="text-xs text-neutral-500">{c.filename}</div>
                    {c.note && (
                      <div className="text-xs text-amber-600">{c.note}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded bg-neutral-200">
                        <div
                          className="h-full bg-indigo-600"
                          style={{ width: `${c.scores?.skillMatch ?? 0}%` }}
                        />
                      </div>
                      <span className="tabular-nums">{c.scores?.skillMatch ?? 0}%</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1 line-clamp-1" title={c.scores?.topSkills?.join(", ") || ""}>
                      {c.scores?.topSkills?.slice(0, 5).join(", ")}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="tabular-nums">{c.scores?.years ?? 0}</span>
                    <span className="text-neutral-500 text-xs ml-1">yrs</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-white">
                      {c.scores?.seniority || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded bg-neutral-200">
                        <div
                          className="h-full bg-emerald-600"
                          style={{ width: `${c.scores?.overall ?? 0}%` }}
                        />
                      </div>
                      <span className="tabular-nums font-medium">{c.scores?.overall ?? 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
