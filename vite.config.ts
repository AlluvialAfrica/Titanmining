import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom', 'react-hook-form'],
          'aws-amplify': ['aws-amplify'],
          'stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'pdf': ['jspdf', 'jspdf-autotable'],
        },
      },
    },
  },
})
