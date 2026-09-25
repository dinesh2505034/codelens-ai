import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkOrInstallRuntimes() {
  if (process.platform !== 'linux') {
    return;
  }

  // Check if javac is already available in PATH or system locations
  try {
    const check = spawnSync('javac', ['-version'], { encoding: 'utf8' });
    if (check.status === 0 || check.stdout || check.stderr) {
      console.log('[CodeLens Runtime] System javac detected:', (check.stdout || check.stderr || '').trim());
      return;
    }
  } catch {}

  const localJdkBin = path.resolve(__dirname, '../tools/jdk/bin/javac');
  if (fs.existsSync(localJdkBin)) {
    console.log('[CodeLens Runtime] Portable JDK already installed at', localJdkBin);
    return;
  }

  console.log('[CodeLens Runtime] Javac not found in Linux environment. Setting up portable OpenJDK 17...');
  const toolsDir = path.resolve(__dirname, '../tools');
  const jdkDir = path.join(toolsDir, 'jdk');
  if (!fs.existsSync(toolsDir)) fs.mkdirSync(toolsDir, { recursive: true });

  const tarballPath = path.join(toolsDir, 'openjdk17.tar.gz');
  const url = 'https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jdk/hotspot/normal/eclipse';

  function download(targetUrl, dest) {
    return new Promise((resolve, reject) => {
      https.get(targetUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Download failed with status ${res.statusCode}`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      }).on('error', reject);
    });
  }

  try {
    console.log('[CodeLens Runtime] Downloading Eclipse Temurin OpenJDK 17...');
    await download(url, tarballPath);
    console.log('[CodeLens Runtime] Extracting JDK archive...');
    if (!fs.existsSync(jdkDir)) fs.mkdirSync(jdkDir, { recursive: true });

    // Extract stripping first directory level
    const tarRes = spawnSync('tar', ['-xzf', tarballPath, '-C', jdkDir, '--strip-components=1']);
    if (tarRes.status === 0) {
      console.log('[CodeLens Runtime] Portable OpenJDK 17 installed successfully!');
      try { fs.unlinkSync(tarballPath); } catch {}
    } else {
      console.warn('[CodeLens Runtime] tar extraction warning:', tarRes.stderr?.toString());
    }
  } catch (err) {
    console.warn('[CodeLens Runtime] Portable JDK download failed:', err.message);
  }
}

checkOrInstallRuntimes();
