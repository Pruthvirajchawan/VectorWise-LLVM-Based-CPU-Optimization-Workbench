import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert, Play, ArrowRight, Code2, RefreshCw } from 'lucide-react';
import { Project, CorrectnessTestResult } from '../types/compiler';
import { validateCorrectness } from '../services/api';

interface CorrectnessLabProps {
  project: Project;
  setActiveTab: (tab: string) => void;
}

export const CorrectnessLab: React.FC<CorrectnessLabProps> = ({ project, setActiveTab }) => {
  const mainFile = project.files.find((f) => f.isMain) || project.files[0];
  const [running, setRunning] = useState(false);
  const [inputSize, setInputSize] = useState(10000);
  const [epsilon, setEpsilon] = useState(1e-5);
  const [testResult, setTestResult] = useState<CorrectnessTestResult | null>(null);

  const handleRunValidation = async () => {
    setRunning(true);
    try {
      const res = await validateCorrectness(
        mainFile?.content || '',
        mainFile?.content || '',
        inputSize,
        epsilon
      );
      setTestResult(res);
    } catch (err: any) {
      alert(`Validation error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono mb-2 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Differential Correctness Suite</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Correctness & Testing</h1>
          <p className="text-xs text-slate-600 mt-1">
            Verify that compiler SIMD optimizations (-fvectorize, -ffast-math) maintain program functional correctness and floating-point output equivalence.
          </p>
        </div>

        <button
          onClick={handleRunValidation}
          disabled={running}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          <Play className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Running Differential Validation...' : 'Run Correctness Test'}</span>
        </button>
      </div>

      {/* Input controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs shadow-xs">
        <div className="space-y-1">
          <label className="text-slate-600 font-mono font-semibold">Test Array Size (N):</label>
          <input
            type="number"
            value={inputSize}
            onChange={(e) => setInputSize(parseInt(e.target.value, 10) || 1000)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-600 font-mono font-semibold">Floating Point Epsilon Tolerance:</label>
          <input
            type="number"
            step="0.00001"
            value={epsilon}
            onChange={(e) => setEpsilon(parseFloat(e.target.value) || 1e-5)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
          />
        </div>
      </div>

      {/* Test Output */}
      {testResult && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center space-x-3">
            {testResult.passed ? (
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-red-100 text-red-700 border border-red-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {testResult.passed ? 'Correctness Validated' : 'Output Mismatch Detected'}
              </h3>
              <p className="text-xs text-slate-600">{testResult.diffSummary}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-700 font-bold block">Baseline (-O0) Output:</span>
              <pre className="text-slate-900 text-[11px] whitespace-pre-wrap">{testResult.baselineOutput}</pre>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-blue-700 font-bold block">Candidate (-O3) Output:</span>
              <pre className="text-blue-900 text-[11px] whitespace-pre-wrap">{testResult.candidateOutput}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
