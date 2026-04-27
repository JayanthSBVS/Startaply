import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    // Warn if any single chunk exceeds 600KB
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunk splitting — keeps vendor libraries out of the app bundle
        // so browsers can cache them separately across deploys.
        manualChunks(id) {
          // Framer Motion — large animation library
          if (id.includes('framer-motion')) return 'vendor-motion';
          // Recharts — heavy charting library only used in AdminDashboard
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) return 'vendor-charts';
          // Lucide icons — tree-shaken but still benefits from separate chunk
          if (id.includes('lucide-react')) return 'vendor-icons';
          // React Router
          if (id.includes('react-router')) return 'vendor-router';
          // React + React DOM — must come AFTER react-router to avoid circular
          if (id.includes('node_modules/react')) return 'vendor-react';
          // Everything else in node_modules goes into a shared vendor chunk
          if (id.includes('node_modules')) return 'vendor-misc';
        },
      },
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
