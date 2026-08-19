import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// base: "./"  -> chemins relatifs, fonctionne sur GitHub Pages
// (y compris dans un sous-dossier https://user.github.io/mon-depot/).
export default defineConfig({
  base: "./",
  plugins: [vue()],
});
