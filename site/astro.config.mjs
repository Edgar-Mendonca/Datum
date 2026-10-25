// The Datum family site: https://edgar-mendonca.github.io/Datum/
import { defineConfig } from "astro/config";
import { copyShots } from "./src/lib/github.ts";

export default defineConfig({
  site: "https://edgar-mendonca.github.io",
  base: "/Datum",
  trailingSlash: "ignore",
  build: { inlineStylesheets: "always" },
  integrations: [{ name: "datum-shots", hooks: { "astro:build:done": ({ dir }) => copyShots(dir) } }],
});
