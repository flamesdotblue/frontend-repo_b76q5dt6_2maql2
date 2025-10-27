import { Rocket, FileText } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full border-b border-neutral-200 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
            <Rocket size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">AI Resume Agent</h1>
            <p className="text-xs text-neutral-500">Match resumes to your Job Description in seconds</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-neutral-600 text-sm">
          <FileText size={16} />
          <span>Local-only demo UI</span>
        </div>
      </div>
    </header>
  );
}
