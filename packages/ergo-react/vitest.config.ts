import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  cacheDir: '../../.turbo/packages/ergo-react/test',
  test: {
    environment: 'happy-dom',
    pool: 'threads',
    restoreMocks: true,
    setupFiles: ['./src/test.setup.ts']
  }
}));
