import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "../static",
        emptyOutDir: true,
        sourcemap: true
    },
    server: {
        proxy: {
            '/conversation': {
                target: 'http://127.0.0.1:50505',
                changeOrigin: true,
                secure: false,      
                ws: true,
            },
            '/history': {
                target: 'http://127.0.0.1:50505',
                changeOrigin: true,
                secure: false,      
                ws: true,
            },
            '/frontend_settings': {
                target: 'http://127.0.0.1:50505',
                changeOrigin: true,
                secure: false,      
                ws: true,
            },
            '/.auth': {
                target: 'http://127.0.0.1:50505',
                changeOrigin: true,
                secure: false,      
                ws: true,
            }
        }
    }
});
