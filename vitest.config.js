import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    // Enable globals for easier test writing
    globals: true,
    // Use jsdom environment for DOM testing
    environment: 'jsdom',
    // Coverage configuration
    coverage: {
      provider: 'v8', // Using the modern V8 provider
      enabled: true,  // Always collect coverage
      clean: true,    // Clean coverage results before running
      all: true,      // Include all files, even untested ones
      
      // Which files to include in coverage
      include: [
        'src/**/*.{js,vue}',
        '!src/main.js' // Exclude main app file
      ],
      
      // Reporters to generate
      reporter: ['text', 'json', 'html'],
      
      // Output directory
      reportsDirectory: './coverage',
      
      // Thresholds (adjust to your needs)
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  }
})