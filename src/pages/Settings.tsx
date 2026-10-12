import React from 'react';
import { Settings as SettingsIcon, Cpu, ShieldCheck, Terminal, HardDrive } from 'lucide-react';
import { SystemCapabilities } from '../types/compiler';

interface SettingsProps {
  capabilities: SystemCapabilities | null;
}

export const Settings: React.FC<SettingsProps> = ({ capabilities }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono mb-2 font-semibold">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>VectorWise System Configuration</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Compiler & Environment Settings</h1>
        <p className="text-xs text-slate-600 mt-1">
          Inspect backend compiler paths, sandbox execution boundaries, and hardware capability specifications.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-600" />
          <span>Compiler Environment Information</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 block">Clang Compiler Path:</span>
            <span className="text-blue-700 font-bold">/usr/bin/clang++</span>
            <span className="text-slate-500 block text-[10px] mt-1">Version: {capabilities?.clangVersion}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 block">Host Architecture & CPU:</span>
            <span className="text-blue-700 font-bold">{capabilities?.hostArch}</span>
            <span className="text-slate-500 block text-[10px] mt-1">{capabilities?.hostCpu}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 block">Sandbox Mode:</span>
            <span className="text-emerald-700 font-bold">Isolated Process Sandbox</span>
            <span className="text-slate-500 block text-[10px] mt-1">Temporary Dir: /tmp/vectorwise_sandbox</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 block">Default Target Triple:</span>
            <span className="text-blue-700 font-bold">x86_64-pc-linux-gnu</span>
            <span className="text-slate-500 block text-[10px] mt-1">AVX / SSE Vector Instruction Set</span>
          </div>
        </div>
      </div>
    </div>
  );
};
