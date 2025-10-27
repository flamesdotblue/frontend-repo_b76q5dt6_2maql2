import { useRef, useState } from "react";
import { Upload, FileText, AlertTriangle } from "lucide-react";

export default function ResumeDropzone({ onCandidatesAdded, backendUrl, loading, setLoading, setError }) {
  const inputRef = useRef(null);
  const [warnings, setWarnings] = useState([]);

  const parseViaBackend = async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${backendUrl}/api/parse`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`Parse failed (${res.status})`);
    const data = await res.json();
    return String(data.text || "");
  };

  const handleFiles = async (files) => {
    setError?.("");
    const newWarnings = [];
    const candidates = [];
    const supported = [
      ".pdf",
      ".docx",
      ".txt",
      ".md",
      ".markdown",
    ];

    setLoading?.(true);
    try {
      for (const file of files) {
        const name = file.name || "resume";
        const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
        if (!supported.includes(ext)) {
          newWarnings.push(`"${name}" is an unsupported type for parsing. Try PDF, DOCX, TXT, or MD.`);
          continue;
        }
        try {
          const text = backendUrl ? await parseViaBackend(file) : "";
          candidates.push({
            id: crypto.randomUUID(),
            name: name.replace(/\.[^/.]+$/, ""),
            filename: name,
            rawText: text,
          });
        } catch (e) {
          newWarnings.push(`Failed to parse ${name}.`);
        }
      }
    } finally {
      setLoading?.(false);
    }

    setWarnings(newWarnings);
    if (candidates.length) onCandidatesAdded?.(candidates);
  };

  return (
    <section>
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 p-6 text-center hover:border-indigo-400 transition-colors">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Upload />
          </div>
          <p className="text-sm text-neutral-700">
            Drag and drop resumes here, or
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="ml-1 underline decoration-indigo-400 underline-offset-4 hover:text-indigo-600"
              disabled={loading}
            >
              browse files
            </button>
          </p>
          <p className="text-xs text-neutral-500">Accepted: PDF, DOCX, TXT, MD</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md,.markdown"
            onChange={(e) => handleFiles(Array.from(e.target.files || []))}
            className="hidden"
          />
        </div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files || []);
            handleFiles(files);
          }}
          className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 text-left"
        >
          <div className="flex items-center gap-2 text-neutral-700 mb-2">
            <FileText size={16} />
            <span className="text-sm font-medium">Recently added</span>
          </div>
          <p className="text-xs text-neutral-500">Uploaded resumes will appear in the results once scored.</p>
        </div>
        {warnings.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-left text-amber-800">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} />
              <span className="font-medium text-sm">Import notes</span>
            </div>
            <ul className="list-disc pl-5 text-xs space-y-1">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
