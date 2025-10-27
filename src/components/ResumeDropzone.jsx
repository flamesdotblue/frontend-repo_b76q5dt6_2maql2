import { useRef, useState } from "react";
import { Upload, FileText, AlertTriangle } from "lucide-react";

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export default function ResumeDropzone({ onCandidatesAdded }) {
  const inputRef = useRef(null);
  const [warnings, setWarnings] = useState([]);

  const handleFiles = async (files) => {
    const accepted = ["text/plain", "text/markdown"]; // Keep parsing simple client-side
    const newWarnings = [];
    const candidates = [];

    for (const file of files) {
      if (!accepted.includes(file.type)) {
        newWarnings.push(`"${file.name}" is ${file.type || "an unsupported type"}. For the live demo, please upload .txt or .md files.`);
        // We'll still record the candidate with no parsed text
        candidates.push({
          id: crypto.randomUUID(),
          name: file.name.replace(/\.[^/.]+$/, ""),
          filename: file.name,
          rawText: "",
          note: "Unsupported file type; text not parsed in-browser",
        });
        continue;
      }
      try {
        const text = await readFileAsText(file);
        candidates.push({
          id: crypto.randomUUID(),
          name: file.name.replace(/\.[^/.]+$/, ""),
          filename: file.name,
          rawText: String(text || ""),
          note: undefined,
        });
      } catch (e) {
        newWarnings.push(`Failed to read ${file.name}.`);
      }
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
            >
              browse files
            </button>
          </p>
          <p className="text-xs text-neutral-500">For the demo, use .txt or .md files for best results.</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".txt,.md,.markdown"
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
