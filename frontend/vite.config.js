import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import handlebars from "vite-plugin-handlebars";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  if (command === "serve") {
    return {
      plugins: [
        react(),
        handlebars({
          context: {
            ogTitle: "MecoAI - Dev",
            ogDescription: "This is a dev build",
            ogImage:
              "http://localhost:5173/public/mecoai-breaking-moon-landing.png",
          },
        }),
      ],
      build: {
        outDir: "../static",
        emptyOutDir: true,
        sourcemap: true,
      },
      server: {
        proxy: {
          "/conversation": {
            target: "http://127.0.0.1:50505",
            changeOrigin: true,
            secure: false,
            ws: true,
          },
          "/history": {
            target: "http://127.0.0.1:50505",
            changeOrigin: true,
            secure: false,
            ws: true,
          },
          "/frontend_settings": {
            target: "http://127.0.0.1:50505",
            changeOrigin: true,
            secure: false,
            ws: true,
          },
          "/.auth": {
            target: "http://127.0.0.1:50505",
            changeOrigin: true,
            secure: false,
            ws: true,
          },
          "/auth": {
            target: "http://127.0.0.1:50505",
            changeOrigin: true,
            secure: false,
            ws: true,
          },
        },
      },
    };
  } else {
    const ogImage =
      "https://chat.mecorocketscientist.com/public/mecoai-breaking-moon-landing.png";

    const ogDescription =
      "MecoAI draws upon the Mecoteca a corpus on the scientific study and engineering of rocket systems and spacecraft. It covers aspects of chemistry, math, thermodynamics, aerodynamics, material science, electronics, failure analysis, machining, metalworking, model building, composite techniques, experimental methods, natural forces, laws of motion, and technical problems related to the development and experimentation of rockets, including stories and lessons from spaceflight history.";

    const ogTitle = "MecoAI - Your Rocket Scientist Buddy";

    return {
      plugins: [
        react(),
        handlebars({
          context: {
            ogTitle: ogTitle,
            ogDescription: ogDescription,
            ogImage: ogImage,
          },
        }),
      ],
      build: {
        outDir: "../static",
        emptyOutDir: true,
        sourcemap: true,
      },
    };
  }
});
