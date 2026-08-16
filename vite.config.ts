import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fsMiddlewarePlugin } from './middleware/vite-fs-middleware';

export default defineConfig({
    plugins: [react(), fsMiddlewarePlugin()],
});
