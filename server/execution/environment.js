import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedEnvironment = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

/**
 * Common known search paths for compilers on Windows & Linux
 */
const KNOWN_PATHS = {
  python: [
    'python',
    'python3',
    'py',
    'C:\\Python314\\python.exe',
    'C:\\Python313\\python.exe',
    'C:\\Python312\\python.exe',
    'C:\\Python311\\python.exe',
    'C:\\Python310\\python.exe',
    '/usr/bin/python3',
    '/usr/local/bin/python3'
  ],
  clang: [
    'clang',
    'C:\\Program Files\\LLVM\\bin\\clang.exe',
    'C:\\Program Files (x86)\\LLVM\\bin\\clang.exe',
    '/usr/bin/clang',
    '/usr/local/bin/clang'
  ],
  clangpp: [
    'clang++',
    'C:\\Program Files\\LLVM\\bin\\clang++.exe',
    'C:\\Program Files (x86)\\LLVM\\bin\\clang++.exe',
    '/usr/bin/clang++',
    '/usr/local/bin/clang++'
  ],
  gcc: [
    'gcc',
    path.resolve(__dirname, '../tools/w64devkit/bin/gcc.exe'),
    path.resolve(process.cwd(), 'server/tools/w64devkit/bin/gcc.exe'),
    'C:\\msys64\\ucrt64\\bin\\gcc.exe',
    'C:\\msys64\\mingw64\\bin\\gcc.exe',
    'C:\\MinGW\\bin\\gcc.exe',
    'C:\\w64devkit\\bin\\gcc.exe',
    '/usr/bin/gcc',
    '/usr/local/bin/gcc'
  ],
  gpp: [
    'g++',
    path.resolve(__dirname, '../tools/w64devkit/bin/g++.exe'),
    path.resolve(process.cwd(), 'server/tools/w64devkit/bin/g++.exe'),
    'C:\\msys64\\ucrt64\\bin\\g++.exe',
    'C:\\msys64\\mingw64\\bin\\g++.exe',
    'C:\\MinGW\\bin\\g++.exe',
    'C:\\w64devkit\\bin\\g++.exe',
    '/usr/bin/g++',
    '/usr/local/bin/g++'
  ],
  javac: [
    'javac',
    'C:\\Program Files\\Android\\Android Studio\\jbr\\bin\\javac.exe',
    'C:\\Program Files\\Java\\jdk-21\\bin\\javac.exe',
    'C:\\Program Files\\Java\\jdk-17\\bin\\javac.exe',
    '/usr/bin/javac',
    '/usr/lib/jvm/default-java/bin/javac'
  ],
  java: [
    'java',
    'C:\\Program Files\\Android\\Android Studio\\jbr\\bin\\java.exe',
    'C:\\Program Files\\Java\\jdk-21\\bin\\java.exe',
    'C:\\Program Files\\Java\\jdk-17\\bin\\java.exe',
    '/usr/bin/java',
    '/usr/lib/jvm/default-java/bin/java'
  ]
};

function findJavaRuntime() {
  const isWin = process.platform === 'win32';
  const candidates = [];

  // 1. JAVA_HOME / JDK_HOME
  if (process.env.JAVA_HOME) {
    candidates.push(path.join(process.env.JAVA_HOME, 'bin', isWin ? 'javac.exe' : 'javac'));
  }
  if (process.env.JDK_HOME) {
    candidates.push(path.join(process.env.JDK_HOME, 'bin', isWin ? 'javac.exe' : 'javac'));
  }

  // 2. Android Studio JBR
  if (isWin) {
    candidates.push('C:\\Program Files\\Android\\Android Studio\\jbr\\bin\\javac.exe');
    candidates.push('C:\\Program Files (x86)\\Android\\Android Studio\\jbr\\bin\\javac.exe');
    if (process.env.LOCALAPPDATA) {
      candidates.push(path.join(process.env.LOCALAPPDATA, 'Programs', 'Android Studio', 'jbr', 'bin', 'javac.exe'));
    }
  }

  // 3. Common Windows JDK Installations
  if (isWin) {
    const searchRoots = [
      'C:\\Program Files\\Java',
      'C:\\Program Files\\Eclipse Adoptium',
      'C:\\Program Files\\Amazon Corretto',
      'C:\\Program Files\\Microsoft',
      'C:\\Program Files\\Zulu'
    ];
    for (const root of searchRoots) {
      try {
        if (fs.existsSync(root)) {
          const subdirs = fs.readdirSync(root);
          for (const sub of subdirs) {
            candidates.push(path.join(root, sub, 'bin', 'javac.exe'));
          }
        }
      } catch {}
    }
  }

  // 3b. Common Linux JDK Installations
  if (!isWin) {
    const linuxRoots = [
      '/usr/lib/jvm',
      '/opt/jdk',
      '/opt/java',
      '/usr/local/java',
      path.resolve(__dirname, '../tools/jdk')
    ];
    for (const root of linuxRoots) {
      try {
        if (fs.existsSync(root)) {
          const directJavac = path.join(root, 'bin', 'javac');
          if (fs.existsSync(directJavac)) candidates.push(directJavac);

          const subdirs = fs.readdirSync(root);
          for (const sub of subdirs) {
            candidates.push(path.join(root, sub, 'bin', 'javac'));
          }
        }
      } catch {}
    }
  }

  // 4. PATH lookup via where.exe / which
  try {
    const whereProc = spawnSync(isWin ? 'where.exe' : 'which', ['javac'], { encoding: 'utf8', timeout: 2000 });
    if (whereProc.status === 0 && whereProc.stdout) {
      const found = whereProc.stdout.trim().split('\n')[0].trim();
      if (found) candidates.push(found);
    }
  } catch {}

  // 5. Fallback standard commands
  candidates.push('javac');
  candidates.push('/usr/bin/javac');
  candidates.push('/usr/lib/jvm/default-java/bin/javac');

  for (const candidate of candidates) {
    try {
      if (candidate.includes(path.sep) && !fs.existsSync(candidate)) {
        continue;
      }

      // Check corresponding java binary
      let javaBin = 'java';
      if (candidate.includes(path.sep)) {
        const dir = path.dirname(candidate);
        const companionJava = path.join(dir, isWin ? 'java.exe' : 'java');
        if (fs.existsSync(companionJava)) {
          javaBin = companionJava;
        }
      }

      const proc = spawnSync(candidate, ['-version'], {
        encoding: 'utf8',
        timeout: 6000,
        windowsHide: true
      });

      if (proc.status === 0 || (proc.stdout && proc.stdout.trim().length > 0) || (proc.stderr && proc.stderr.trim().length > 0)) {
        const versionOutput = (proc.stdout || proc.stderr || '').trim().split('\n')[0];
        return {
          available: true,
          javacPath: candidate,
          javaPath: javaBin,
          version: versionOutput
        };
      }
    } catch {}
  }

  return { available: false, javacPath: null, javaPath: null, version: null };
}

function tryFindBinary(candidates, testArgs = ['--version'], timeoutMs = 3000) {
  for (const candidate of candidates) {
    try {
      if (candidate.includes(path.sep) && !fs.existsSync(candidate)) {
        continue;
      }

      const proc = spawnSync(candidate, testArgs, {
        encoding: 'utf8',
        timeout: timeoutMs,
        windowsHide: true
      });

      if (proc.status === 0 || (proc.stdout && proc.stdout.trim().length > 0) || (proc.stderr && proc.stderr.trim().length > 0)) {
        const output = (proc.stdout || proc.stderr || '').trim().split('\n')[0];
        return {
          available: true,
          binPath: candidate,
          version: output
        };
      }
    } catch {}
  }
  return { available: false, binPath: null, version: null };
}

export function detectEnvironment(forceRefresh = false) {
  const now = Date.now();
  if (cachedEnvironment && !forceRefresh && (now - lastCheckTime < CACHE_TTL_MS)) {
    return cachedEnvironment;
  }

  // 1. Python check
  const pythonCheck = tryFindBinary(KNOWN_PATHS.python, ['--version']);

  // 2. C Compiler check (clang or gcc)
  const clangCheck = tryFindBinary(KNOWN_PATHS.clang, ['--version']);
  const gccCheck = clangCheck.available ? { available: false } : tryFindBinary(KNOWN_PATHS.gcc, ['--version']);
  const cCompiler = clangCheck.available
    ? { available: true, compiler: 'clang', binPath: clangCheck.binPath, version: clangCheck.version }
    : (gccCheck.available
      ? { available: true, compiler: 'gcc', binPath: gccCheck.binPath, version: gccCheck.version }
      : { available: false, compiler: null, binPath: null, version: null });

  // 3. C++ Compiler check (clang++ or g++)
  const clangppCheck = tryFindBinary(KNOWN_PATHS.clangpp, ['--version']);
  const gppCheck = clangppCheck.available ? { available: false } : tryFindBinary(KNOWN_PATHS.gpp, ['--version']);
  const cppCompiler = clangppCheck.available
    ? { available: true, compiler: 'clang++', binPath: clangppCheck.binPath, version: clangppCheck.version }
    : (gppCheck.available
      ? { available: true, compiler: 'g++', binPath: gppCheck.binPath, version: gppCheck.version }
      : { available: false, compiler: null, binPath: null, version: null });

  // 4. Java Compiler & Runtime check
  const javaRuntime = findJavaRuntime();

  cachedEnvironment = {
    checkedAt: new Date().toISOString(),
    runtimes: {
      python: pythonCheck,
      c: cCompiler,
      cpp: cppCompiler,
      java: javaRuntime
    }
  };

  lastCheckTime = now;
  return cachedEnvironment;
}

export function getLanguageCompiler(language) {
  const env = detectEnvironment();
  const lang = (language || 'python').toLowerCase();

  if (lang === 'python' || lang === 'py') {
    return {
      language: 'python',
      supported: env.runtimes.python.available,
      binPath: env.runtimes.python.binPath,
      version: env.runtimes.python.version
    };
  }

  if (lang === 'c') {
    return {
      language: 'c',
      supported: env.runtimes.c.available,
      compiler: env.runtimes.c.compiler,
      binPath: env.runtimes.c.binPath,
      version: env.runtimes.c.version
    };
  }

  if (lang === 'cpp' || lang === 'c++') {
    return {
      language: 'cpp',
      supported: env.runtimes.cpp.available,
      compiler: env.runtimes.cpp.compiler,
      binPath: env.runtimes.cpp.binPath,
      version: env.runtimes.cpp.version
    };
  }

  if (lang === 'java') {
    return {
      language: 'java',
      supported: env.runtimes.java.available,
      javacPath: env.runtimes.java.javacPath,
      javaPath: env.runtimes.java.javaPath,
      version: env.runtimes.java.version
    };
  }

  return { language: lang, supported: false };
}
