import next from "eslint-config-next";

const eslintConfig = [
  ...next,
  {
    ignores: [".next/**", "out/**", "dist/**", "node_modules/**", "coverage/**"],
  },
];

export default eslintConfig;
