import { spawn } from 'node:child_process';

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

async function main(): Promise<void> {
  for (const [index, phase] of phases.entries()) {
    console.log(`\n[${index + 1}/${phases.length}] ${phase.name}`);
    await runNpmScript(phase.script);
  }

  console.log('\nAll E2E phases completed successfully. Reports are available under reports/.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
