import React from 'react';
import {
  Cpu,
  Code2,
  BarChart3,
  CheckCircle2,
  Zap,
  Layers,
  ArrowUpRight,
  Activity,
  Sparkles,
  Terminal,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { Project, SystemCapabilities } from '../types/compiler';

interface OverviewDashboardProps {
  capabilities: SystemCapabilities | null;
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (p: Project) => void;
  setActiveTab: (tab: string) => void;
  onCreateProject: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  capabilities,
  projects,
  activeProject,
  setActiveProject,
  setActiveTab,
  onCreateProject,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>LLVM 14 SIMD Optimization & Benchmarking</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              CPU Performance Workspace
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Inspect compiler decisions. Validate SIMD vectorization & loop unrolling. Measure hardware-level execution benchmarks with microsecond precision.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('compiler-lab')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              <span>Open Compiler Lab</span>
            </button>
            <button
              onClick={onCreateProject}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-cyan-300" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Compiler Status</span>
            <Terminal className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {capabilities?.clangAvailable ? `Clang ${capabilities.clangVersion}` : 'Checking...'}
          </div>
          <p className="text-[11px] text-emerald-600 font-mono font-medium">x86_64 SIMD Enabled</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Execution Sandbox</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">Isolated Container</div>
          <p className="text-[11px] text-slate-500 font-mono">CPU & Memory Quotas Active</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Workloads</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">{projects.length} Projects</div>
          <p className="text-[11px] text-blue-600 font-mono font-medium">SIMD, Reductions, MatMul</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Benchmark Engine</span>
            <BarChart3 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">hrtime High-Res</div>
          <p className="text-[11px] text-slate-500 font-mono">Microsecond Precision</p>
        </div>
      </div>

      {/* Main Grid: Projects & Quick Starters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Workspaces & Projects */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Workspaces & C++ Workloads</h2>
            </div>
            <button
              onClick={onCreateProject}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Workload</span>
            </button>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => {
              const isCurrent = activeProject?.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    setActiveProject(proj);
                    setActiveTab('compiler-lab');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-50/80 border-blue-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      {proj.name}
                      {isCurrent && (
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-600 text-white">
                          Active
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">{proj.compilerConfig.optLevel}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{proj.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Flags: {proj.compilerConfig.extraFlags.join(' ')}</span>
                    <span className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                      Inspect LLVM IR <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Quick Workflows */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Quick Workflows</h2>
          </div>

          <div className="space-y-3">
            <div
              onClick={() => setActiveTab('compiler-lab')}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer space-y-1"
            >
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-600" />
                <span>1. Inspect LLVM IR & Assembly</span>
              </div>
              <p className="text-[11px] text-slate-600">
                View generated vector loops, register usage, and Intel SIMD instructions.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('analyzer')}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer space-y-1"
            >
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-600" />
                <span>2. Optimization Remarks & Aliasing</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Parse `-Rpass=loop-vectorize` remarks to discover why loops missed auto-vectorization.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('benchmark-lab')}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer space-y-1"
            >
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                <span>3. Real Hardware Benchmark</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Compare `-O0` vs `-O3` speedup ratios, execution times, and binary size reduction.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('correctness')}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer space-y-1"
            >
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>4. Output Verification</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Verify floating-point precision equality across baseline and optimized builds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
