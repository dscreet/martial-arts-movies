import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/{unit,integration}/**/*.test.{ts,tsx}'],
    reporters: process.env.CI ? ['dot', 'json'] : ['default'],
    coverage: {
      exclude: ['src/components/ui/**', 'src/__mocks__/**', 'src/lib/utils.ts', 'src/lib/prisma.ts'],
      reporter: process.env.CI ? ['text-summary', 'json-summary'] : ['text', 'html'],
    },
  },
});
