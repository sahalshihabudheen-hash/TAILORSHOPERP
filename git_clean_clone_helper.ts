import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function main() {
  console.log("Starting a clean workspace initialization from GitHub...");
  
  if (fs.existsSync('temp_repo')) {
    fs.rmSync('temp_repo', { recursive: true, force: true });
  }

  try {
    console.log("Cloning repository...");
    execSync('git clone https://github.com/sahalshihabudheen-hash/TAILORSHOPERP.git temp_repo');
    console.log("Cloned successfully!");
    
    // Clear existing folders and files in the root (except node_modules, temp_repo, etc.)
    const itemsToKeep = [
      'node_modules',
      'temp_repo',
      'firebase-applet-config.json',
      '.env',
      'firebase-blueprint.json',
      'firebase.json',
      'firestore.rules'
    ];
    
    const rootFiles = fs.readdirSync('.');
    for (const file of rootFiles) {
      if (itemsToKeep.includes(file)) {
        continue;
      }
      const fullPath = path.join('.', file);
      try {
        if (fs.statSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`Cleared directory: ${file}`);
        } else {
          fs.unlinkSync(fullPath);
          console.log(`Cleared file: ${file}`);
        }
      } catch (err: any) {
        console.warn(`Could not delete ${file}:`, err.message);
      }
    }
    
    // Copy all contents from temp_repo to root .
    console.log("Copying files from clone to root workspace...");
    copyRecursive('temp_repo', '.');
    
    // Cleanup
    fs.rmSync('temp_repo', { recursive: true, force: true });
    console.log("Workspace has been fully replaced with your GitHub repository state!");
  } catch (error: any) {
    console.error("Failed clean clone process:", error.message || error);
  }
}

function copyRecursive(src: string, dest: string) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats && stats.isDirectory();
  
  if (isDirectory) {
    if (path.basename(src) === '.git') {
      return; // Skip git data
    }
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItem) => {
      copyRecursive(path.join(src, childItem), path.join(dest, childItem));
    });
  } else {
    const filename = path.basename(src);
    if (filename === 'firebase-applet-config.json' && fs.existsSync(dest)) {
      console.log("Skipping firebase-applet-config.json to protect credentials.");
      return;
    }
    fs.copyFileSync(src, dest);
  }
}

main();
