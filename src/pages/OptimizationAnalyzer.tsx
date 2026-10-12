import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Info,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  Zap,
} from 'lucide-react';
import { Project, AnalysisFinding, OptimizationRemark } from '../types/compiler';
import { analyzeCode, AnalysisResponse } from '../services/api';

interface OptimizationAnalyzerProps {
  project: Project;
  setActiveTab: (tab: string) => void;
}

export const OptimizationAnalyzer: React.FC<OptimizationAnalyzerProps> = ({ project, setActiveTab }) => {
  const mainFile = project.files.find((f) => f.isMain) || project.files[0];
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    runAnalysis();
  }, [project.id]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await analyzeCode(mainFile?.content || '');
      setAnalysisData(res);
    } catch (err: any) {
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const findings = analysisData?.findings || [];
  const filteredFindings = findings.filter((f) => {
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && f.severity !== selectedSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono mb-2 font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>LLVM Static & Diagnostic Pass Analyzer</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Optimization Analyzer</h1>
          <p className="text-xs text-slate-600 mt-1">
            Automated compiler diagnostics extraction, pointer aliasing hazard detection, and evidence-based SIMD vectorization checks.
          </p>
        </div>

        <button
          onClick={runAnalysis}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Analyzing...' : 'Re-run Analysis'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-mono">Total Observations</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {findings.length}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-mono">High Severity Issues</span>
          <div className="text-2xl font-extrabold text-amber-600 font-mono mt-1">
            {findings.filter((f) => f.severity === 'high').length}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-mono">Vectorization Status</span>
          <div className="text-2xl font-extrabold text-blue-600 font-mono mt-1">
            {analysisData?.summary.hasVectorizationPassed ? 'Vectorized' : 'Needs Optimization'}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center gap-3 text-xs shadow-xs">
        <span className="text-slate-600 font-mono flex items-center gap-1.5 font-semibold">
          <Filter className="w-3.5 h-3.5 text-blue-600" /> Filter Findings:
        </span>

        {/* Category Selector */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 font-mono focus:outline-none cursor-pointer"
        >
          <option value="all">All Categories</option>
          <option value="vectorization">Vectorization</option>
          <option value="loop">Loop Transformations</option>
          <option value="aliasing">Pointer Aliasing</option>
          <option value="memory">Memory Locality</option>
        </select>

        {/* Severity Selector */}
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 font-mono focus:outline-none cursor-pointer"
        >
          <option value="all">All Severities</option>
          <option value="high">High Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="info">Informational</option>
        </select>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 space-y-2 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-sm font-medium">No findings matching active filters.</p>
          </div>
        ) : (
          filteredFindings.map((finding) => (
            <div
              key={finding.id}
              className={`bg-white border rounded-2xl p-5 space-y-3 shadow-xs ${
                finding.severity === 'high'
                  ? 'border-amber-300'
                  : finding.severity === 'medium'
                  ? 'border-blue-300'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      finding.severity === 'high'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {finding.severity} severity
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Category: {finding.category}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200">
                    Confidence: {finding.confidence}
                  </span>
                </div>

                <span className="text-xs font-mono text-slate-500">
                  {finding.sourceFile}:{finding.line}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{finding.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{finding.explanation}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 space-y-1">
                <span className="text-slate-500 text-[11px] font-bold">Compiler Evidence:</span>
                <p>{finding.evidence}</p>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-emerald-700 font-semibold">
                  Suggested Action: {finding.suggestedAction}
                </span>
                <button
                  onClick={() => setActiveTab('benchmark-lab')}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center gap-1 border border-blue-200 transition-colors cursor-pointer"
                >
                  <span>Test in Benchmark Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
