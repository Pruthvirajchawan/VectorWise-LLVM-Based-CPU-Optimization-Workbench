import React, { useState, useEffect } from 'react';
import { FlaskConical, Plus, CheckCircle2, Play, Code2, ArrowRight } from 'lucide-react';
import { Project, OptimizationExperiment } from '../types/compiler';
import { getExperiments, createExperiment } from '../services/api';

interface ExperimentsProps {
  project: Project;
  setActiveTab: (tab: string) => void;
}

export const OptimizationExperiments: React.FC<ExperimentsProps> = ({ project, setActiveTab }) => {
  const [experiments, setExperiments] = useState<OptimizationExperiment[]>([]);
  const [name, setName] = useState('SIMD Restrict Pointer Experiment');
  const [hypothesis, setHypothesis] = useState(
    'Adding __restrict to C++ array pointers will eliminate runtime aliasing checks and allow LLVM -O3 auto-vectorization.'
  );

  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    try {
      const data = await getExperiments();
      setExperiments(data);
    } catch (e) {
      // ignore
    }
  };

  const handleCreate = async () => {
    try {
      const newExp = await createExperiment({
        projectId: project.id,
        name,
        hypothesis,
        baselineSource: project.files[0]?.content || '',
        candidateSource: project.files[0]?.content || '',
      });
      setExperiments((prev) => [newExp, ...prev]);
    } catch (err: any) {
      alert(`Failed to save experiment: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono mb-2 font-semibold">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Controlled Scientific Experiments</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Optimization Experiments</h1>
          <p className="text-xs text-slate-600 mt-1">
            Formulate hypotheses, track baseline vs candidate revisions, and document compiler behavior.
          </p>
        </div>
      </div>

      {/* New Experiment Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Formulate New Experiment</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-600 font-mono font-semibold block mb-1">Experiment Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-600 font-mono font-semibold block mb-1">Optimization Hypothesis:</label>
            <textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
            />
          </div>

          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Save Experiment
          </button>
        </div>
      </div>

      {/* Experiments History */}
      <div className="space-y-3">
        {experiments.map((exp) => (
          <div key={exp.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-xs shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">{exp.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                {exp.status}
              </span>
            </div>
            <p className="text-slate-700 font-mono">{exp.hypothesis}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
