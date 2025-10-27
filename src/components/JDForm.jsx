import { useState, useEffect } from "react";
import { ClipboardList, Sparkles } from "lucide-react";

export default function JDForm({ value, onChange, onScore, disabled }) {
  const [local, setLocal] = useState(value || "");

  useEffect(() => {
    setLocal(value || "");
  }, [value]);

  return (
    <section className="w-full">
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-2 text-neutral-700">
            <ClipboardList size={18} />
            <h2 className="font-medium">Job Description</h2>
          </div>
        </div>
        <div className="p-5">
          <textarea
            value={local}
            onChange={(e) => {
              setLocal(e.target.value);
              onChange?.(e.target.value);
            }}
            placeholder="Paste the job description here..."
            className="w-full min-h-[160px] rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 text-sm resize-y"
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Tip: More specific JDs produce better, more accurate scoring.
            </p>
            <button
              type="button"
              onClick={onScore}
              disabled={disabled || !local.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium shadow hover:bg-indigo-700 disabled:opacity-50"
            >
              <Sparkles size={16} />
              Score Candidates
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
