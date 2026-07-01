import baseConfig from "@kanban/eslint-config/base.js";

const eslintConfig = [
  {
    ignores: [
      "dist-renderer/**",
      "dist/**",
      "out/**"
    ]
  },
  ...baseConfig,
];

export default eslintConfig;
