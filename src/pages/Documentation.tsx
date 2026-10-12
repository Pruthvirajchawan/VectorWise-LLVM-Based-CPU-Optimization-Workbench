import React from 'react';
import { BookOpen, Terminal, Cpu, Zap, Code2 } from 'lucide-react';

export const Documentation: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono mb-2 font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>VectorWise Optimization Knowledge Base</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">LLVM CPU Optimization Reference</h1>
        <p className="text-xs text-slate-600 mt-1">
          Essential guidelines for writing auto-vectorizable C++ code, tuning Clang optimization pragmas, and interpreting SIMD assembly instructions.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-600" />
            <span>1. Essential Clang Compiler Flags</span>
          </h3>
          <ul className="text-xs space-y-2 text-slate-700 font-mono">
            <li>
              <span className="text-blue-700 font-bold">-O3</span>: Enables aggressive loop vectorization, loop unrolling, and inline heuristics.
            </li>
            <li>
              <span className="text-blue-700 font-bold">-fvectorize</span>: Explicitly enables LLVM loop vectorizer pass.
            </li>
            <li>
              <span className="text-blue-700 font-bold">-ffast-math</span>: Relaxes strict IEEE-754 floating-point reassociation rules to allow vector reduction expansions.
            </li>
            <li>
              <span className="text-blue-700 font-bold">-Rpass=loop-vectorize</span>: Emits detailed optimization remarks when loops successfully vectorize.
            </li>
            <li>
              <span className="text-blue-700 font-bold">-Rpass-missed=loop-vectorize</span>: Explains why a loop failed auto-vectorization (e.g. pointer aliasing, control flow).
            </li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span>2. Clang Loop Pragmas</span>
          </h3>
          <p className="text-xs text-slate-600">
            Guide the LLVM loop vectorizer directly from C++ source annotations:
          </p>
          <pre className="bg-slate-900 p-4 rounded-xl text-blue-300 text-xs font-mono">
{`#pragma clang loop vectorize(enable)
#pragma clang loop interleave(enable)
#pragma clang loop vectorize_width(8)
for (size_t i = 0; i < N; ++i) {
    c[i] = a[i] + b[i];
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};
