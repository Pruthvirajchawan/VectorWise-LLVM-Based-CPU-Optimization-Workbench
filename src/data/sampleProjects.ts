import { Project } from '../types/compiler';

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'sample-array-addition',
    name: 'SIMD Array Vectorization',
    description: 'Demonstrates a standard vector addition loop with memory aliasing considerations and clang auto-vectorization remarks.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    compilerConfig: {
      compilerPath: 'clang++',
      optLevel: '-O3',
      extraFlags: ['-fvectorize', '-ffast-math'],
      enableRemarks: true,
      vectorWidth: 8,
    },
    files: [
      {
        id: 'file-1',
        name: 'add_arrays.cpp',
        isMain: true,
        content: `#include <iostream>
#include <vector>
#include <chrono>
#include <numeric>
#include <iomanip>

// Kernel function to add two arrays
// Note: Adding 'restrict' or using __builtin_assume_aligned can affect vectorization
void add_arrays(
    const float* __restrict a,
    const float* __restrict b,
    float* __restrict out,
    std::size_t n
) {
    #pragma clang loop vectorize(enable)
    for (std::size_t i = 0; i < n; ++i) {
        out[i] = a[i] + b[i];
    }
}

int main(int argc, char** argv) {
    std::size_t n = 1000000;
    if (argc > 1) {
        n = std::stoull(argv[1]);
    }

    std::vector<float> a(n, 1.5f);
    std::vector<float> b(n, 2.5f);
    std::vector<float> out(n, 0.0f);

    auto start = std::chrono::high_resolution_clock::now();
    
    // Warm-up and multiple iterations for reliable benchmarking
    for (int iter = 0; iter < 50; ++iter) {
        add_arrays(a.data(), b.data(), out.data(), n);
    }

    auto end = std::chrono::high_resolution_clock::now();
    double duration = std::chrono::duration<double, std::micro>(end - start).count() / 50.0;

    // Output sample results for correctness verification
    std::cout << "OUTPUT_CHECK: " << out[0] << " " << out[n / 2] << " " << out[n - 1] << std::endl;
    std::cout << "TIME_US: " << std::fixed << std::setprecision(2) << duration << std::endl;

    return (out[0] == 4.0f) ? 0 : 1;
}
`,
      },
    ],
  },
  {
    id: 'sample-dot-product',
    name: 'Vector Reduction (Dot Product)',
    description: 'Examines loop reductions, floating-point reassociation (-ffast-math), and vector accumulator expansion.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    compilerConfig: {
      compilerPath: 'clang++',
      optLevel: '-O3',
      extraFlags: ['-ffast-math', '-fvectorize'],
      enableRemarks: true,
    },
    files: [
      {
        id: 'file-2',
        name: 'dot_product.cpp',
        isMain: true,
        content: `#include <iostream>
#include <vector>
#include <chrono>
#include <numeric>
#include <iomanip>

float compute_dot_product(
    const float* __restrict a,
    const float* __restrict b,
    std::size_t n
) {
    float sum = 0.0f;
    #pragma clang loop vectorize(enable) interleave(enable)
    for (std::size_t i = 0; i < n; ++i) {
        sum += a[i] * b[i];
    }
    return sum;
}

int main(int argc, char** argv) {
    std::size_t n = 500000;
    if (argc > 1) {
        n = std::stoull(argv[1]);
    }

    std::vector<float> a(n, 0.5f);
    std::vector<float> b(n, 2.0f);

    float result = 0.0f;
    auto start = std::chrono::high_resolution_clock::now();

    for (int iter = 0; iter < 100; ++iter) {
        result = compute_dot_product(a.data(), b.data(), n);
    }

    auto end = std::chrono::high_resolution_clock::now();
    double duration = std::chrono::duration<double, std::micro>(end - start).count() / 100.0;

    std::cout << "OUTPUT_CHECK: " << result << std::endl;
    std::cout << "TIME_US: " << std::fixed << std::setprecision(2) << duration << std::endl;

    return 0;
}
`,
      },
    ],
  },
  {
    id: 'sample-matrix-mult',
    name: 'Matrix Multiplication (Cache Locality)',
    description: 'Investigates loop reordering (i-j-k vs i-k-j), spatial cache locality, SIMD intrinsics, and unrolling.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    compilerConfig: {
      compilerPath: 'clang++',
      optLevel: '-O3',
      extraFlags: ['-fvectorize', '-funroll-loops'],
      enableRemarks: true,
    },
    files: [
      {
        id: 'file-3',
        name: 'matrix_mult.cpp',
        isMain: true,
        content: `#include <iostream>
#include <vector>
#include <chrono>
#include <iomanip>

// Optimized i-k-j loop order for contiguous memory access
void matmul_ikj(
    const float* __restrict A,
    const float* __restrict B,
    float* __restrict C,
    int N
) {
    for (int i = 0; i < N; ++i) {
        for (int k = 0; k < N; ++k) {
            float r = A[i * N + k];
            #pragma clang loop vectorize(enable)
            for (int j = 0; j < N; ++j) {
                C[i * N + j] += r * B[k * N + j];
            }
        }
    }
}

int main(int argc, char** argv) {
    int N = 256;
    if (argc > 1) {
        N = std::stoi(argv[1]);
    }

    std::vector<float> A(N * N, 1.0f);
    std::vector<float> B(N * N, 2.0f);
    std::vector<float> C(N * N, 0.0f);

    auto start = std::chrono::high_resolution_clock::now();

    matmul_ikj(A.data(), B.data(), C.data(), N);

    auto end = std::chrono::high_resolution_clock::now();
    double duration = std::chrono::duration<double, std::micro>(end - start).count();

    std::cout << "OUTPUT_CHECK: " << C[0] << " " << C[N * N - 1] << std::endl;
    std::cout << "TIME_US: " << std::fixed << std::setprecision(2) << duration << std::endl;

    return 0;
}
`,
      },
    ],
  },
];
