import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/integration/**/*.test.{ts,tsx}'],
    globals: true,
    coverage: {
      provider: 'v8',
      exclude: ['src/components/ui/**', 'src/__mocks__/**', 'src/lib/utils.ts', 'src/lib/prisma.ts'],
    },
  },
});
