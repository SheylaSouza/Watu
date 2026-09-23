import { spawn } from 'node:child_process';
import { readdir, rm } from 'node:fs/promises';

interface Phase {
  name: string;
  script: string;
}

const phases: Phase[] = [
  { name: 'Database preparation', script: 'db:prepare' },
  { name: 'UI tests', script: 'test:ui' },
  { name: 'Database tests', script: 'test:db' },
  { name: 'WireMock API tests', script: 'test:api' },
];

const generatedArtifactDirectories = [
  'reports/all',
  'reports/api',
  'reports/blobs',
  'reports/db',
  'reports/ui',
  'test-results',
];

function runNpmScript(script: string): Promise<void> {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand, ['run', script], {
      stdio: 'inherit',
      env: process.env,
    });

    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          signal === null
            ? `npm run ${script} exited with code ${String(code)}`
            : `npm run ${script} was terminated by signal ${signal}`,
        ),
      );
    });
  });
}

async function cleanGeneratedArtifacts(): Promise<void> {
  await Promise.all(
    generatedArtifactDirectories.map((directory: string) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
}

async function hasBlobReports(): Promise<boolean> {
  try {
    const files = await readdir('reports/blobs');
    return files.some((file: string) => file.endsWith('.zip'));
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  await cleanGeneratedArtifacts();

  let executionError: unknown;

  try {
    for (const [index, phase] of phases.entries()) {
      console.log(`\n[${index + 1}/${phases.length}] ${phase.name}`);
      await runNpmScript(phase.script);
    }
  } catch (error: unknown) {
    executionError = error;
  }

  if (await hasBlobReports()) {
    console.log('\nBuilding the combined UI, database and API report.');
    try {
      await runNpmScript('reports:merge');
    } catch (mergeError: unknown) {
      if (executionError) {
        console.error('The test run and combined report generation both failed.', mergeError);
      } else {
        executionError = mergeError;
      }
    }
  }

  if (executionError) {
    throw executionError;
  }

  console.log('\nAll E2E phases completed successfully. Reports are available under reports/.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
