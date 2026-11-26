// Checks that package.json only uses the allowed packages.
// Run with: npm run check-deps

import { readFileSync } from 'node:fs';

const ALLOWED_DEPENDENCIES = ['next', 'react', 'react-dom'];

const ALLOWED_DEV_DEPENDENCIES = [
  '@types/node',
  '@types/react',
  '@types/react-dom',
  'eslint',
  'eslint-config-next',
  'jsdom',
  'typescript',
  'vitest',
];

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const problems = [
  ...findExtras('dependencies', pkg.dependencies, ALLOWED_DEPENDENCIES),
  ...findExtras('devDependencies', pkg.devDependencies, ALLOWED_DEV_DEPENDENCIES),
  // These fields can also pull in packages, so nothing is allowed there.
  ...findExtras('peerDependencies', pkg.peerDependencies, []),
  ...findExtras('optionalDependencies', pkg.optionalDependencies, []),
];

if (problems.length > 0) {
  console.error('check-deps failed. These packages are not allowed:\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('\nRemove them and use plain React and CSS instead.');
  process.exit(1);
}

console.log('check-deps passed: only allowed packages are used.');

function findExtras(field, deps, allowed) {
  return Object.keys(deps ?? {})
    .filter((name) => !allowed.includes(name))
    .map((name) => `${name} (in ${field})`);
}
