import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  cacheDir: '../../.turbo/packages/ergo-state/test',
  test: {
    environment: 'node',
    pool: 'threads',
    restoreMocks: true
  }
}));
