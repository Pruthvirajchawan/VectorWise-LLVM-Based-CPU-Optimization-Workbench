export type OptLevel = '-O0' | '-O1' | '-O2' | '-O3' | '-Ofast' | '-Os';

export interface CompilerConfig {
  compilerPath: string; // e.g. "clang++" or "g++"
  optLevel: OptLevel;
  targetTriple?: string; // e.g. "x86_64-unknown-linux-gnu"
  extraFlags: string[]; // e.g. ["-fvectorize", "-ffast-math", "-fno-omit-frame-pointer"]
  enableRemarks: boolean;
  vectorWidth?: number; // e.g. 4, 8, 16
}

export interface Diagnostic {
  id: string;
  type: 'error' | 'warning' | 'note' | 'remark';
  file: string;
  line: number;
  column: number;
  message: string;
  pass?: string; // e.g. "loop-vectorize"
  codeSnippet?: string;
}

export interface OptimizationRemark {
  id: string;
  kind: 'passed' | 'missed' | 'analysis';
  pass: string;
  functionName: string;
  file: string;
  line: number;
  column: number;
  message: string;
  args?: Record<string, string | number>;
}

export interface LlvmIrFunction {
  name: string;
  hasVectorInstructions: boolean;
  isVectorizedLoop: boolean;
  unrollFactor?: number;
  instructionCount: number;
  irCode: string;
}

export interface LlvmIrResult {
  rawIr: string;
  functions: LlvmIrFunction[];
  hasVectorization: boolean;
  vectorInstructionCount: number;
  vectorTypesFound: string[]; // e.g. ["<4 x float>", "<8 x float>"]
}

export interface AssemblyResult {
  rawAssembly: string;
  targetTriple: string;
  simdInstructionsFound: string[]; // e.g. ["vaddps", "vmulps", "vmovups"]
  totalInstructionCount: number;
  instructionCategoryCounts: {
    vectorArithmetic: number;
    vectorMemory: number;
    scalarArithmetic: number;
    branches: number;
  };
}

export interface AnalysisFinding {
  id: string;
  category: 'vectorization' | 'loop' | 'inlining' | 'memory' | 'aliasing' | 'warning';
  severity: 'high' | 'medium' | 'low' | 'info';
  title: string;
  sourceFile: string;
  line: number;
  explanation: string;
  evidence: string;
  suggestedAction: string;
  confidence: 'compiler_remark' | 'ir_derived' | 'heuristic';
}

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  isMain: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  files: ProjectFile[];
  compilerConfig: CompilerConfig;
  createdAt: string;
  updatedAt: string;
}

export interface BenchmarkStats {
  medianUs: number;
  meanUs: number;
  minUs: number;
  maxUs: number;
  stdDevUs: number;
  confidenceIntervalMarginUs: number; // 95% CI error margin
  gflopsEstimate: number; // GFLOPS throughput
  measurements: number[];
  outliersRemoved: number;
  lastOutputCheck?: string;
}

export interface BenchmarkResult {
  id: string;
  projectId: string;
  workloadName: string;
  inputSize: number;
  repetitions: number;
  
  baselineConfig: CompilerConfig;
  candidateConfig: CompilerConfig;

  baselineStats: BenchmarkStats;
  candidateStats: BenchmarkStats;

  speedupRatio: number; // baselineMedian / candidateMedian
  runtimeReductionPercent: number; // ((baseline - candidate) / baseline) * 100
  codeSizeBaselineBytes: number;
  codeSizeCandidateBytes: number;
  correctnessValidated: boolean;
  environmentInfo: {
    cpuModel: string;
    clangVersion: string;
    os: string;
    arch: string;
  };
  timestamp: string;
}

export interface CorrectnessTestResult {
  id: string;
  projectId: string;
  passed: boolean;
  baselineOutput: string;
  candidateOutput: string;
  diffSummary: string;
  exitCodeBaseline: number;
  exitCodeCandidate: number;
  epsilonUsed?: number;
  maxDiff?: number;
  timestamp: string;
}

export interface OptimizationExperiment {
  id: string;
  projectId: string;
  name: string;
  hypothesis: string;
  baselineSource: string;
  candidateSource: string;
  baselineConfig: CompilerConfig;
  candidateConfig: CompilerConfig;
  correctnessResult?: CorrectnessTestResult;
  benchmarkResult?: BenchmarkResult;
  status: 'draft' | 'running' | 'completed' | 'failed';
  conclusion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemCapabilities {
  clangAvailable: boolean;
  clangVersion: string;
  llvmVersion: string;
  gccAvailable: boolean;
  gccVersion: string;
  hostArch: string;
  hostCpu: string;
  supportedTargets: string[];
  executionMode: 'isolated_sandbox' | 'restricted_native';
}

export interface ReportData {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  createdAt: string;
  capabilities: SystemCapabilities;
  sourceCode: string;
  compilerConfig: CompilerConfig;
  diagnostics: Diagnostic[];
  remarks: OptimizationRemark[];
  findings: AnalysisFinding[];
  benchmarkResult?: BenchmarkResult;
  correctnessResult?: CorrectnessTestResult;
  summaryText: string;
}
