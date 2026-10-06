import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 项目站点部署在 /dongle-tech-slang/ 子路径下
export default defineConfig({
  base: '/dongle-tech-slang/',
  plugins: [react()],
});
