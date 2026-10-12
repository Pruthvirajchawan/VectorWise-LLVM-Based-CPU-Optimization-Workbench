import React, { useState, useEffect } from 'react';
import { Project, SystemCapabilities } from './types/compiler';
import { SAMPLE_PROJECTS } from './data/sampleProjects';
import { Shell } from './components/layout/Shell';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { CompilerLab } from './pages/CompilerLab';
import { OptimizationAnalyzer } from './pages/OptimizationAnalyzer';
import { BenchmarkLab } from './pages/BenchmarkLab';
import { CorrectnessLab } from './pages/CorrectnessLab';
import { OptimizationExperiments } from './pages/OptimizationExperiments';
import { ResultsReports } from './pages/ResultsReports';
import { Documentation } from './pages/Documentation';
import { Settings } from './pages/Settings';
import { getCapabilities, getProjects, createProject, updateProject } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project>(SAMPLE_PROJECTS[0]);
  const [capabilities, setCapabilities] = useState<SystemCapabilities | null>(null);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const caps = await getCapabilities();
      setCapabilities(caps);

      const dbProjects = await getProjects();
      if (dbProjects && dbProjects.length > 0) {
        setProjects(dbProjects);
        setActiveProject(dbProjects[0]);
      } else {
        // Seed default sample projects into backend
        for (const proj of SAMPLE_PROJECTS) {
          try {
            await createProject(proj);
          } catch (e) {
            // ignore
          }
        }
        setProjects(SAMPLE_PROJECTS);
        setActiveProject(SAMPLE_PROJECTS[0]);
      }
    } catch (err) {
      console.warn('Backend loading fallback to sample projects:', err);
    }
  };

  const refreshProjects = async () => {
    try {
      const data = await getProjects();
      if (data && data.length > 0) {
        setProjects(data);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleUpdateProject = async (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setActiveProject(updated);
    try {
      await updateProject(updated.id, updated);
    } catch (e) {
      // ignore
    }
  };

  const handleCreateNewProject = async () => {
    try {
      const newProj = await createProject({
        name: `Workload Experiment #${projects.length + 1}`,
        description: 'New SIMD C++ performance kernel.',
        files: [
          {
            id: `file-${Date.now()}`,
            name: 'kernel.cpp',
            isMain: true,
            content: `#include <iostream>\n#include <vector>\n\nvoid kernel(const float* __restrict a, float* __restrict b, int n) {\n    #pragma clang loop vectorize(enable)\n    for (int i = 0; i < n; ++i) {\n        b[i] = a[i] * 2.0f;\n    }\n}\n\nint main() {\n    std::cout << "Kernel execution ready" << std::endl;\n    return 0;\n}\n`,
          },
        ],
        compilerConfig: {
          compilerPath: 'clang++',
          optLevel: '-O3',
          extraFlags: ['-fvectorize', '-ffast-math'],
          enableRemarks: true,
        },
      });
      setProjects((prev) => [newProj, ...prev]);
      setActiveProject(newProj);
      setActiveTab('compiler-lab');
    } catch (err: any) {
      alert(`Failed to create project: ${err.message}`);
    }
  };

  return (
    <Shell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      activeProject={activeProject}
      setActiveProject={setActiveProject}
      projects={projects}
      refreshProjects={refreshProjects}
      capabilities={capabilities}
    >
      {activeTab === 'overview' && (
        <OverviewDashboard
          capabilities={capabilities}
          projects={projects}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          setActiveTab={setActiveTab}
          onCreateProject={handleCreateNewProject}
        />
      )}

      {activeTab === 'compiler-lab' && activeProject && (
        <CompilerLab
          project={activeProject}
          onUpdateProject={handleUpdateProject}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'analyzer' && activeProject && (
        <OptimizationAnalyzer
          project={activeProject}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'benchmark-lab' && activeProject && (
        <BenchmarkLab
          project={activeProject}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'correctness' && activeProject && (
        <CorrectnessLab
          project={activeProject}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'experiments' && activeProject && (
        <OptimizationExperiments
          project={activeProject}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'reports' && activeProject && (
        <ResultsReports project={activeProject} />
      )}

      {activeTab === 'docs' && <Documentation />}

      {activeTab === 'settings' && <Settings capabilities={capabilities} />}
    </Shell>
  );
}
