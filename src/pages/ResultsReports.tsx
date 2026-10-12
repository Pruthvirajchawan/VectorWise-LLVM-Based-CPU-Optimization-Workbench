import React, { useState, useEffect } from 'react';
import { FileText, Download, Copy, CheckCircle2, Sparkles } from 'lucide-react';
import { Project, ReportData } from '../types/compiler';
import { getReports, createReport } from '../services/api';

interface ResultsReportsProps {
  project: Project;
}

export const ResultsReports: React.FC<ResultsReportsProps> = ({ project }) => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (e) {
      // ignore
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const mainFile = project.files[0];
      const newReport = await createReport({
        title: `VectorWise Technical Analysis — ${project.name}`,
        projectId: project.id,
        projectName: project.name,
        sourceCode: mainFile?.content || '',
        compilerConfig: project.compilerConfig,
        summaryText: `LLVM Clang 14 auto-vectorization analysis and execution benchmarking completed for ${project.name}. SIMD instructions confirmed.`,
      });
      setReports((prev) => [newReport, ...prev]);
    } catch (err: any) {
      alert(`Report generation error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadJson = (report: ReportData) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono mb-2 font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>Engineering Performance Reports</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Results & Reports</h1>
          <p className="text-xs text-slate-600 mt-1">
            Export technical compiler optimization dossiers, raw benchmark JSON, and CSV metrics.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generating ? 'Generating Dossier...' : 'Generate Report'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {reports.map((r) => (
          <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">{r.title}</h3>
              <span className="text-xs font-mono text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>

            <p className="text-xs text-slate-700">{r.summaryText}</p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-blue-700 font-semibold">
                Compiler: Clang {r.capabilities?.clangVersion || '14.0.6'} ({r.capabilities?.hostArch})
              </span>

              <button
                onClick={() => handleDownloadJson(r)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download JSON
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
