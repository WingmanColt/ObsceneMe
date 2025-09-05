// vite.config.ts

export default {
  server: {
    proxy: {
      // This will proxy all requests from /assets to the C# backend
      '/assets': {
        target: 'http://localhost:44312', // Replace with your C# backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/assets/, '/wwwroot/assets'),
      },
    },
  },
};
