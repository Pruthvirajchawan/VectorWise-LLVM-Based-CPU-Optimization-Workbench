import React, { useState, useEffect } from 'react';
import {
  Cpu,
  LayoutDashboard,
  Code2,
  Sparkles,
  BarChart3,
  CheckCircle2,
  FlaskConical,
  FileText,
  BookOpen,
  Settings,
  ChevronRight,
  Menu,
  X,
  Activity,
  Layers,
  Bot,
  Circle,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';
import { Project, SystemCapabilities } from '../../types/compiler';
import { CopilotDrawer } from '../CopilotDrawer';
import { getCapabilities, getProjects } from '../../services/api';

interface ShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeProject: Project | null;
  setActiveProject: (proj: Project) => void;
  projects: Project[];
  refreshProjects: () => void;
  capabilities: SystemCapabilities | null;
}

export const Shell: React.FC<ShellProps> = ({
  children,
  activeTab,
  setActiveTab,
  activeProject,
  setActiveProject,
  projects,
  refreshProjects,
  capabilities,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'compiler-lab', label: 'Compiler Lab', icon: Code2 },
    { id: 'analyzer', label: 'Optimization Analyzer', icon: Activity },
    { id: 'benchmark-lab', label: 'Benchmark Lab', icon: BarChart3 },
    { id: 'correctness', label: 'Correctness & Testing', icon: CheckCircle2 },
    { id: 'experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'reports', label: 'Results & Reports', icon: FileText },
    { id: 'docs', label: 'Documentation', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white transition-colors duration-200 ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#080D18] text-slate-100'
      }`}
    >
      {/* TOP HEADER */}
      <header
        className={`h-14 border-b px-4 flex items-center justify-between sticky top-0 z-40 transition-colors ${
          isLight
            ? 'bg-white/90 border-slate-200 backdrop-blur-md shadow-xs'
            : 'bg-[#0B1220]/90 border-blue-900/40 backdrop-blur-md'
        }`}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="p-2 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span
                className={`font-bold text-base tracking-tight ${
                  isLight
                    ? 'text-slate-900'
                    : 'bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent'
                }`}
              >
                VectorWise
              </span>
              <span
                className={`ml-2 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                  isLight
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-blue-500/10 text-cyan-400 border border-blue-500/20'
                }`}
              >
                LLVM Workbench
              </span>
            </div>
          </div>
        </div>

        {/* Center: Active Project Selector */}
        <div
          className={`hidden md:flex items-center space-x-2 border rounded-lg px-3 py-1.5 text-xs ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-[#111B2B] border-blue-900/40 text-slate-300'
          }`}
        >
          <Layers className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
          <span className={`font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Project:</span>
          <select
            value={activeProject?.id || ''}
            onChange={(e) => {
              const proj = projects.find((p) => p.id === e.target.value);
              if (proj) setActiveProject(proj);
            }}
            className={`bg-transparent font-medium focus:outline-none cursor-pointer ${
              isLight ? 'text-slate-900' : 'text-slate-200'
            }`}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className={isLight ? 'bg-white text-slate-900' : 'bg-[#0D1422] text-slate-200'}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right Header Status & Tools */}
        <div className="flex items-center space-x-3">
          {/* Environment Status Badge */}
          <div
            className={`hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-mono border ${
              isLight
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{capabilities?.clangAvailable ? `Clang ${capabilities.clangVersion}` : 'Checking Toolchain...'}</span>
          </div>

          {/* Copilot Assistant Trigger Button */}
          <button
            onClick={() => setCopilotOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/15 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Compiler Copilot</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Toggle Light / Dark theme"
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-16'
          } border-r flex flex-col transition-all duration-300 z-30 select-none ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0B1220] border-blue-900/40'
          }`}
        >
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? isLight
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                        : 'bg-blue-600/15 text-cyan-400 border border-blue-500/30 shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? isLight
                          ? 'text-blue-600'
                          : 'text-cyan-400'
                        : isLight
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Capabilities Overview */}
          {sidebarOpen && capabilities && (
            <div
              className={`p-3 m-2 rounded-xl border text-[11px] space-y-1 font-mono ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#111B2B] border-blue-900/30 text-slate-400'
              }`}
            >
              <div
                className={`flex items-center justify-between font-sans font-medium text-xs ${
                  isLight ? 'text-slate-800' : 'text-slate-300'
                }`}
              >
                <span>Target System</span>
                <span className={isLight ? 'text-blue-600 font-mono' : 'text-cyan-400 font-mono'}>
                  {capabilities.hostArch}
                </span>
              </div>
              <div className="truncate text-slate-500">{capabilities.hostCpu}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-sans font-medium">
                <Zap className="w-3 h-3" /> Real Execution Enabled
              </div>
            </div>
          )}
        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <main className={`flex-1 overflow-y-auto p-4 lg:p-6 ${isLight ? 'bg-slate-100' : 'bg-[#080D18]'}`}>
          {children}
        </main>
      </div>

      {/* COMPILER COPILOT DRAWER */}
      <CopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        activeCode={activeProject?.files.find((f) => f.isMain)?.content}
      />
    </div>
  );
};
