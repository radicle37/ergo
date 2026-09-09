import { readFileSync } from 'node:fs';

const declaration = readFileSync(
  new URL('../build/exportedStoreFactory.d.ts', import.meta.url),
  'utf8'
);

for (const internalReference of ['ergo-state/adapter-internal', 'node_modules', '.pnpm']) {
  if (declaration.includes(internalReference)) {
    throw new Error(`Emitted declaration leaks internal reference: ${internalReference}`);
  }
}

for (const publicType of ['ErgoReactStoreApi', 'ErgoReactStoreSelectorMap']) {
  if (!declaration.includes(`import(\"ergo-react\").${publicType}`)) {
    throw new Error(`Emitted declaration does not use public type: ${publicType}`);
  }
}
