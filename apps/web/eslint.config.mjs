import { defineConfig } from "eslint/config";
import nextjsConfig from "@kanban/eslint-config/nextjs.js";

const eslintConfig = defineConfig([
  ...nextjsConfig,
]);

export default eslintConfig;
