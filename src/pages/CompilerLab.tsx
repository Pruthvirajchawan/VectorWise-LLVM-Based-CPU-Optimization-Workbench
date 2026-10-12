import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Code2,
  Play,
  Save,
  AlertCircle,
  Sparkles,
  Terminal,
  FileCode,
  FileText,
  Copy,
  Download,
  Search,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Layers,
  Settings2,
  Info,
  Zap,
  Boxes,
} from 'lucide-react';
import { Project, CompilerConfig, Diagnostic, OptimizationRemark } from '../types/compiler';
import { compileCode, CompileResponse } from '../services/api';

interface CompilerLabProps {
  project: Project;
  onUpdateProject: (p: Project) => void;
  setActiveTab: (tab: string) => void;
}

export const CompilerLab: React.FC<CompilerLabProps> = ({ project, onUpdateProject, setActiveTab }) => {
  const mainFile = project.files.find((f) => f.isMain) || project.files[0];
  const [code, setCode] = useState(mainFile?.content || '');
  const [isDirty, setIsDirty] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState<CompileResponse | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'remarks' | 'ir' | 'assembly' | 'diagnostics' | 'logs'>('remarks');

  const [optLevel, setOptLevel] = useState<CompilerConfig['optLevel']>(project.compilerConfig.optLevel || '-O3');
  const [extraFlagsText, setExtraFlagsText] = useState(project.compilerConfig.extraFlags.join(' '));

  useEffect(() => {
    setCode(mainFile?.content || '');
    setIsDirty(false);
  }, [project.id]);

  const handleSave = () => {
    const updatedFiles = project.files.map((f) => (f.id === mainFile.id ? { ...f, content: code } : f));
    const updatedConfig: CompilerConfig = {
      ...project.compilerConfig,
      optLevel,
      extraFlags: extraFlagsText.split(' ').filter(Boolean),
    };
    onUpdateProject({
      ...project,
      files: updatedFiles,
      compilerConfig: updatedConfig,
    });
    setIsDirty(false);
  };

  const handleCompile = async () => {
    handleSave();
    setCompiling(true);
    try {
      const config: CompilerConfig = {
        compilerPath: 'clang++',
        optLevel,
        extraFlags: extraFlagsText.split(' ').filter(Boolean),
        enableRemarks: true,
      };
      const res = await compileCode(code, config, mainFile.name);
      setCompileResult(res);

      if (res.diagnostics.length > 0) {
        setActiveInspectorTab('diagnostics');
      } else if (res.remarks.length > 0) {
        setActiveInspectorTab('remarks');
      } else {
        setActiveInspectorTab('ir');
      }
    } catch (err: any) {
      alert(`Compilation failed: ${err.message}`);
    } finally {
      setCompiling(false);
    }
  };

  const handleInsertSnippet = (snippet: string) => {
    setCode((prev) => `${snippet}\n${prev}`);
    setIsDirty(true);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col space-y-3 font-sans">
      {/* Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>{mainFile.name}</span>
              {isDirty && (
                <span className="w-2 h-2 rounded-full bg-amber-500" title="Unsaved changes"></span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-mono">{project.name}</p>
          </div>
        </div>

        {/* Compiler Flags Quick Config */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
          <Settings2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500 font-mono font-semibold">Opt:</span>
          <select
            value={optLevel}
            onChange={(e) => {
              setOptLevel(e.target.value as any);
              setIsDirty(true);
            }}
            className="bg-transparent font-mono text-blue-600 font-bold focus:outline-none cursor-pointer"
          >
            <option value="-O0" className="bg-white text-slate-900">
              -O0 (Debug)
            </option>
            <option value="-O1" className="bg-white text-slate-900">
              -O1 (Basic)
            </option>
            <option value="-O2" className="bg-white text-slate-900">
              -O2 (Release)
            </option>
            <option value="-O3" className="bg-white text-slate-900">
              -O3 (Vectorized)
            </option>
            <option value="-Ofast" className="bg-white text-slate-900">
              -Ofast (Aggressive)
            </option>
          </select>

          <span className="text-slate-300">|</span>
          <input
            type="text"
            value={extraFlagsText}
            onChange={(e) => {
              setExtraFlagsText(e.target.value);
              setIsDirty(true);
            }}
            placeholder="-fvectorize -ffast-math"
            className="bg-transparent font-mono text-slate-800 w-44 focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* Primary Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 border border-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          <button
            onClick={handleCompile}
            disabled={compiling}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${compiling ? 'animate-spin' : ''}`} />
            <span>{compiling ? 'Compiling...' : 'Compile & Analyze'}</span>
          </button>
        </div>
      </div>

      {/* Quick Snippets & Pragmas Toolbar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-[11px] overflow-x-auto shrink-0">
        <span className="text-slate-500 font-semibold font-mono flex items-center gap-1 shrink-0">
          <Zap className="w-3.5 h-3.5 text-blue-600" /> Quick Pragma Hints:
        </span>
        <button
          onClick={() => handleInsertSnippet('#pragma clang loop vectorize(enable)')}
          className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono shrink-0 cursor-pointer shadow-2xs"
        >
          + #pragma clang loop vectorize(enable)
        </button>
        <button
          onClick={() => handleInsertSnippet('#pragma clang loop interleave(enable)')}
          className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono shrink-0 cursor-pointer shadow-2xs"
        >
          + #pragma clang loop interleave(enable)
        </button>
      </div>

      {/* Main 2-Panel Split: Code Editor (Left) & Inspector (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
        {/* Left: Monaco Editor */}
        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-xs">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600 font-mono">
            <span>C++ Source Editor</span>
            <span>Clang C++17</span>
          </div>
          <div className="flex-1 min-h-[350px]">
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={code}
              onChange={(val) => {
                setCode(val || '');
                setIsDirty(true);
              }}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                padding: { top: 12 },
              }}
            />
          </div>
        </div>

        {/* Right: Compiler Inspector */}
        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-xs">
          {/* Tabs Navigation */}
          <div className="bg-slate-50 border-b border-slate-200 px-2 pt-2 flex space-x-1 overflow-x-auto text-xs font-sans">
            <button
              onClick={() => setActiveInspectorTab('remarks')}
              className={`px-3 py-2 rounded-t-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeInspectorTab === 'remarks'
                  ? 'bg-white text-blue-600 border-t border-x border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Remarks ({compileResult?.remarks.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveInspectorTab('ir')}
              className={`px-3 py-2 rounded-t-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeInspectorTab === 'ir'
                  ? 'bg-white text-blue-600 border-t border-x border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>LLVM IR</span>
            </button>

            <button
              onClick={() => setActiveInspectorTab('assembly')}
              className={`px-3 py-2 rounded-t-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeInspectorTab === 'assembly'
                  ? 'bg-white text-blue-600 border-t border-x border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Assembly</span>
            </button>

            <button
              onClick={() => setActiveInspectorTab('diagnostics')}
              className={`px-3 py-2 rounded-t-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeInspectorTab === 'diagnostics'
                  ? 'bg-white text-blue-600 border-t border-x border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Diagnostics ({compileResult?.diagnostics.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveInspectorTab('logs')}
              className={`px-3 py-2 rounded-t-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeInspectorTab === 'logs'
                  ? 'bg-white text-blue-600 border-t border-x border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Output Stream</span>
            </button>
          </div>

          {/* Inspector Content */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
            {!compileResult && !compiling && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3 font-sans">
                <Code2 className="w-10 h-10 text-slate-400" />
                <p className="text-sm font-medium text-slate-700">No compilation results yet</p>
                <p className="text-xs max-w-sm text-slate-500">
                  Click <span className="text-blue-600 font-semibold">"Compile & Analyze"</span> above to trigger LLVM pass analysis, remarks extraction, IR generation, and SIMD instruction inspection.
                </p>
              </div>
            )}

            {compiling && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600 space-y-3 font-sans">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium">Running Clang Optimization Passes...</p>
              </div>
            )}

            {compileResult && !compiling && (
              <>
                {/* 1. REMARKS TAB */}
                {activeInspectorTab === 'remarks' && (
                  <div className="space-y-3 font-sans">
                    {compileResult.remarks.length === 0 ? (
                      <p className="text-slate-500 italic">No optimization remarks emitted for current configuration.</p>
                    ) : (
                      compileResult.remarks.map((r, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border ${
                            r.kind === 'passed'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1 text-xs">
                            <span className="font-bold font-mono uppercase px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                              {r.kind === 'passed' ? '✓ Vectorized' : '⚠ Missed'}
                            </span>
                            <span className="text-slate-500 font-mono">Line {r.line}:{r.column}</span>
                          </div>
                          <p className="text-xs font-mono">{r.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 2. LLVM IR TAB */}
                {activeInspectorTab === 'ir' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-600 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-bold">
                          {compileResult.llvmIr.hasVectorization ? '✓ Vector SIMD Types Detected' : 'Scalar IR'}
                        </span>
                        {compileResult.llvmIr.vectorTypesFound?.map((vt, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                            {vt}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleCopyText(compileResult.llvmIr.rawIr)}
                        className="text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy IR
                      </button>
                    </div>
                    <pre className="text-slate-100 bg-slate-900 p-4 rounded-xl leading-relaxed overflow-x-auto text-[11px]">
                      {compileResult.llvmIr.rawIr}
                    </pre>
                  </div>
                )}

                {/* 3. ASSEMBLY TAB */}
                {activeInspectorTab === 'assembly' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-600 font-sans">
                      <span>Target: {compileResult.assembly.targetTriple}</span>
                      <div className="flex items-center gap-1.5">
                        {compileResult.assembly.simdInstructionsFound.map((inst, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                            {inst}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Instruction Categories Summary */}
                    {compileResult.assembly.instructionCategoryCounts && (
                      <div className="grid grid-cols-4 gap-2 font-sans text-[11px] pb-2">
                        <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg text-blue-800">
                          <span className="block text-[10px] text-blue-600">Vector Math:</span>
                          <span className="font-bold text-sm">{compileResult.assembly.instructionCategoryCounts.vectorArithmetic}</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800">
                          <span className="block text-[10px] text-slate-500">Vector Mem:</span>
                          <span className="font-bold text-sm">{compileResult.assembly.instructionCategoryCounts.vectorMemory}</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800">
                          <span className="block text-[10px] text-slate-500">Scalar Math:</span>
                          <span className="font-bold text-sm">{compileResult.assembly.instructionCategoryCounts.scalarArithmetic}</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800">
                          <span className="block text-[10px] text-slate-500">Branches:</span>
                          <span className="font-bold text-sm">{compileResult.assembly.instructionCategoryCounts.branches}</span>
                        </div>
                      </div>
                    )}

                    <pre className="text-slate-100 bg-slate-900 p-4 rounded-xl leading-relaxed overflow-x-auto text-[11px]">
                      {compileResult.assembly.rawAssembly}
                    </pre>
                  </div>
                )}

                {/* 4. DIAGNOSTICS TAB */}
                {activeInspectorTab === 'diagnostics' && (
                  <div className="space-y-2 font-sans">
                    {compileResult.diagnostics.length === 0 ? (
                      <p className="text-emerald-700 font-medium">✓ Clean compile. Zero warnings or errors.</p>
                    ) : (
                      compileResult.diagnostics.map((d, i) => (
                        <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800">
                          <div className="font-mono text-xs font-bold mb-1">
                            {d.file}:{d.line}:{d.column} [{d.type}]
                          </div>
                          <p className="text-xs">{d.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 5. LOGS TAB */}
                {activeInspectorTab === 'logs' && (
                  <pre className="text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-xl whitespace-pre-wrap leading-relaxed text-[11px]">
                    {compileResult.rawCompilerOutput}
                  </pre>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
