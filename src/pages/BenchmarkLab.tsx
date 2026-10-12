import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Play,
  Zap,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  FileCode,
  ShieldAlert,
  Gauge,
  Activity,
} from 'lucide-react';
import { Project, BenchmarkResult, CompilerConfig } from '../types/compiler';
import { runBenchmark } from '../services/api';

interface BenchmarkLabProps {
  project: Project;
  setActiveTab: (tab: string) => void;
}

export const BenchmarkLab: React.FC<BenchmarkLabProps> = ({ project, setActiveTab }) => {
  const mainFile = project.files.find((f) => f.isMain) || project.files[0];
  const [running, setRunning] = useState(false);
  const [inputSize, setInputSize] = useState<number>(1000000);
  const [repetitions, setRepetitions] = useState<number>(15);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkResult | null>(null);

  const [baselineOpt, setBaselineOpt] = useState<CompilerConfig['optLevel']>('-O0');
  const [candidateOpt, setCandidateOpt] = useState<CompilerConfig['optLevel']>('-O3');
  const [candidateFlags, setCandidateFlags] = useState<string>('-fvectorize -ffast-math');

  const handleRunBenchmark = async () => {
    setRunning(true);
    try {
      const baselineConfig: CompilerConfig = {
        compilerPath: 'clang++',
        optLevel: baselineOpt,
        extraFlags: [],
        enableRemarks: false,
      };

      const candidateConfig: CompilerConfig = {
        compilerPath: 'clang++',
        optLevel: candidateOpt,
        extraFlags: candidateFlags.split(' ').filter(Boolean),
        enableRemarks: true,
      };

      const result = await runBenchmark(
        mainFile?.content || '',
        project.name,
        inputSize,
        repetitions,
        baselineConfig,
        candidateConfig,
        project.id
      );

      setBenchmarkData(result);
    } catch (err: any) {
      alert(`Benchmark Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const chartData = benchmarkData
    ? [
        {
          name: `Baseline (${benchmarkData.baselineConfig.optLevel})`,
          medianUs: benchmarkData.baselineStats.medianUs,
          gflops: benchmarkData.baselineStats.gflopsEstimate,
          fill: '#d97706',
        },
        {
          name: `Candidate (${benchmarkData.candidateConfig.optLevel})`,
          medianUs: benchmarkData.candidateStats.medianUs,
          gflops: benchmarkData.candidateStats.gflopsEstimate,
          fill: '#2563eb',
        },
      ]
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono mb-2 font-semibold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>High-Resolution Microsecond Execution Harness</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Benchmark Lab</h1>
          <p className="text-xs text-slate-600 mt-1">
            Reproducible CPU execution benchmarking with IQR outlier filtering and GFLOPS throughput calculations.
          </p>
        </div>

        <button
          onClick={handleRunBenchmark}
          disabled={running}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
        >
          <Play className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Running Benchmark Pipeline...' : 'Execute Benchmark'}</span>
        </button>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-slate-200 rounded-2xl p-5 text-xs shadow-xs">
        {/* Baseline Config */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-amber-300">
          <span className="font-bold text-amber-800 font-mono text-xs uppercase block">
            1. Baseline Build Config
          </span>
          <div className="space-y-1">
            <label className="text-slate-600">Optimization Level:</label>
            <select
              value={baselineOpt}
              onChange={(e) => setBaselineOpt(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-slate-900 font-mono cursor-pointer"
            >
              <option value="-O0">-O0 (Unoptimized Baseline)</option>
              <option value="-O1">-O1 (Minimal)</option>
              <option value="-O2">-O2 (Standard)</option>
            </select>
          </div>
        </div>

        {/* Candidate Config */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-blue-300">
          <span className="font-bold text-blue-800 font-mono text-xs uppercase block">
            2. Candidate Build Config
          </span>
          <div className="space-y-1">
            <label className="text-slate-600">Optimization Level:</label>
            <select
              value={candidateOpt}
              onChange={(e) => setCandidateOpt(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-slate-900 font-mono cursor-pointer"
            >
              <option value="-O2">-O2 (Release)</option>
              <option value="-O3">-O3 (Vectorized Loop)</option>
              <option value="-Ofast">-Ofast (Aggressive Fast-Math)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-slate-600">Flags:</label>
            <input
              type="text"
              value={candidateFlags}
              onChange={(e) => setCandidateFlags(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-900 font-mono"
            />
          </div>
        </div>

        {/* Workload Inputs */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="font-bold text-slate-800 font-mono text-xs uppercase block">
            3. Workload Parameters
          </span>
          <div className="space-y-1">
            <label className="text-slate-600">Input Size (elements):</label>
            <input
              type="number"
              value={inputSize}
              onChange={(e) => setInputSize(parseInt(e.target.value, 10) || 1000)}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-900 font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-600">Measurement Repetitions:</label>
            <input
              type="number"
              value={repetitions}
              onChange={(e) => setRepetitions(parseInt(e.target.value, 10) || 5)}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-900 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Results Display */}
      {benchmarkData && (
        <div className="space-y-6">
          {/* Headline Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-blue-300 rounded-2xl p-5 text-center shadow-xs">
              <span className="text-xs text-slate-500 font-mono">Speedup Ratio</span>
              <div className="text-3xl font-extrabold text-blue-600 font-mono mt-1">
                {benchmarkData.speedupRatio}x
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Faster Execution</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs">
              <span className="text-xs text-slate-500 font-mono">Candidate GFLOPS</span>
              <div className="text-3xl font-extrabold text-emerald-600 font-mono mt-1">
                {benchmarkData.candidateStats.gflopsEstimate}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">GigaFLOPs / Sec</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs">
              <span className="text-xs text-slate-500 font-mono">Baseline Median</span>
              <div className="text-2xl font-bold text-amber-600 font-mono mt-1">
                {benchmarkData.baselineStats.medianUs.toFixed(1)} µs
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                ±{benchmarkData.baselineStats.confidenceIntervalMarginUs} µs (95% CI)
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs">
              <span className="text-xs text-slate-500 font-mono">Candidate Median</span>
              <div className="text-2xl font-bold text-blue-600 font-mono mt-1">
                {benchmarkData.candidateStats.medianUs.toFixed(1)} µs
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                ±{benchmarkData.candidateStats.confidenceIntervalMarginUs} µs (95% CI)
              </span>
            </div>
          </div>

          {/* Recharts Bar Comparison Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Median Execution Duration (Microseconds) — Lower is Better</span>
              </h3>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Outliers Removed via IQR Filter
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} unit=" µs" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a' }}
                    itemStyle={{ color: '#2563eb' }}
                  />
                  <Bar dataKey="medianUs" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
