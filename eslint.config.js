const { FlatCompat } = require("@eslint/eslintrc");
const prettierPlugin = require("eslint-plugin-prettier");

const compat = new FlatCompat({
  baseDirectory: process.cwd(),
  recommendedConfig: require("eslint/use-at-your-own-risk").builtinRules,
});

module.exports = [
  ...compat.extends("eslint:recommended"),
  ...compat.extends("plugin:react-hooks/recommended"),
  ...compat.extends("plugin:prettier/recommended"),
  {
    ignores: ["dist", ".next", "node_modules"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
];
