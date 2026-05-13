import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['lib/**/*.test.ts', 'lib/**/*.test.tsx', 'tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['node_modules', 'e2e', '.next', 'out'],
  },
})
