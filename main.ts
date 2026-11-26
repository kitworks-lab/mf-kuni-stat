import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

function assertAppEntry(source: string): void {
  const entry = join(source, 'app', 'index.html');
  if (!existsSync(entry)) {
    throw new Error(`Missing app entry point: ${entry}`);
  }
}

function copyAssets(source: string, target: string): void {
  mkdirSync(target, { recursive: true });
  cpSync(join(source, 'app'), join(target, 'app'), { recursive: true });
  mkdirSync(join(target, 'screenshots'), { recursive: true });
  if (existsSync(join(source, 'screenshots'))) {
    cpSync(join(source, 'screenshots'), join(target, 'screenshots'), { recursive: true });
  }
}

function writeDossier(target: string): void {
  writeFileSync(join(target, 'dossier.json'), buildDossier(target, dossierCaps));
}

assertAppEntry(here);
copyAssets(here, out);
writeDossier(out);
