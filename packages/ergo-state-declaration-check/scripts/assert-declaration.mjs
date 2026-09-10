import { readFileSync } from 'node:fs';

const declaration = readFileSync(
  new URL('../build/exportedStoreFactory.d.ts', import.meta.url),
  'utf8'
);

for (const internalReference of ['internalTypes', 'adapter-internal', 'node_modules', '.pnpm']) {
  if (declaration.includes(internalReference)) {
    throw new Error(`Emitted declaration leaks internal reference: ${internalReference}`);
  }
}

for (const publicType of ['ErgoVanillaStoreApi', 'ErgoStoreSelectorMap']) {
  if (!declaration.includes(`import("ergo-state").${publicType}`)) {
    throw new Error(`Emitted declaration does not use public type: ${publicType}`);
  }
}
