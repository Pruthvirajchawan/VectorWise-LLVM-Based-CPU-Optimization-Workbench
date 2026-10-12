import {
  Project,
  CompilerConfig,
  Diagnostic,
  OptimizationRemark,
  AnalysisFinding,
  BenchmarkResult,
  CorrectnessTestResult,
  OptimizationExperiment,
  SystemCapabilities,
  ReportData,
} from '../types/compiler';

const API_BASE = '/api';

export async function getCapabilities(): Promise<SystemCapabilities> {
  const res = await fetch(`${API_BASE}/capabilities`);
  if (!res.ok) {
    throw new Error('Failed to fetch system capabilities');
  }
  return res.json();
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) {
    throw new Error('Failed to fetch projects');
  }
  return res.json();
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to create project');
  }
  return res.json();
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to update project');
  }
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error('Failed to delete project');
  }
}

export interface CompileResponse {
  jobId: string;
  compileSuccess: boolean;
  rawCompilerOutput: string;
  diagnostics: Diagnostic[];
  remarks: OptimizationRemark[];
  llvmIr: {
    rawIr: string;
    hasVectorization: boolean;
    vectorInstructionCount: number;
    vectorTypesFound?: string[];
  };
  assembly: {
    rawAssembly: string;
    targetTriple: string;
    simdInstructionsFound: string[];
    totalInstructionCount: number;
    instructionCategoryCounts?: {
      vectorArithmetic: number;
      vectorMemory: number;
      scalarArithmetic: number;
      branches: number;
    };
  };
  binarySizeBytes: number;
}

export async function compileCode(
  code: string,
  compilerConfig: CompilerConfig,
  fileName: string = 'main.cpp'
): Promise<CompileResponse> {
  const res = await fetch(`${API_BASE}/compiler/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, compilerConfig, fileName }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Compilation request failed');
  }
  return res.json();
}

export interface AnalysisResponse {
  analysisId: string;
  findings: AnalysisFinding[];
  summary: {
    totalFindings: number;
    highSeverityCount: number;
    hasVectorizationPassed: boolean;
  };
}

export async function analyzeCode(
  code: string,
  remarks: OptimizationRemark[] = [],
  llvmIr: string = '',
  diagnostics: Diagnostic[] = []
): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE}/analyses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, remarks, llvmIr, diagnostics }),
  });
  if (!res.ok) {
    throw new Error('Analysis request failed');
  }
  return res.json();
}

export async function runBenchmark(
  code: string,
  workloadName: string,
  inputSize: number,
  repetitions: number,
  baselineConfig: CompilerConfig,
  candidateConfig: CompilerConfig,
  projectId?: string
): Promise<BenchmarkResult> {
  const res = await fetch(`${API_BASE}/benchmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      workloadName,
      inputSize,
      repetitions,
      baselineConfig,
      candidateConfig,
      projectId,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Benchmark execution failed');
  }
  return res.json();
}

export async function validateCorrectness(
  codeBaseline: string,
  codeCandidate: string,
  inputSize: number = 1000,
  epsilon: number = 1e-5
): Promise<CorrectnessTestResult> {
  const res = await fetch(`${API_BASE}/experiments/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codeBaseline, codeCandidate, inputSize, epsilon }),
  });
  if (!res.ok) {
    throw new Error('Validation execution failed');
  }
  return res.json();
}

export async function getExperiments(): Promise<OptimizationExperiment[]> {
  const res = await fetch(`${API_BASE}/experiments`);
  if (!res.ok) {
    throw new Error('Failed to fetch experiments');
  }
  return res.json();
}

export async function createExperiment(exp: Partial<OptimizationExperiment>): Promise<OptimizationExperiment> {
  const res = await fetch(`${API_BASE}/experiments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exp),
  });
  if (!res.ok) {
    throw new Error('Failed to save experiment');
  }
  return res.json();
}

export async function getReports(): Promise<ReportData[]> {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) {
    throw new Error('Failed to fetch reports');
  }
  return res.json();
}

export async function createReport(data: Partial<ReportData>): Promise<ReportData> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to create report');
  }
  return res.json();
}

export async function askCopilot(
  prompt: string,
  context: {
    sourceCode?: string;
    remarks?: OptimizationRemark[];
    diagnostics?: Diagnostic[];
    llvmIr?: string;
    assembly?: string;
    codeSnippet?: string;
  }
): Promise<{ explanation: string }> {
  const res = await fetch(`${API_BASE}/assistant/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, context }),
  });
  if (!res.ok) {
    throw new Error('Copilot inquiry failed');
  }
  return res.json();
}
