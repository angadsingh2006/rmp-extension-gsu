const globals = require("globals");

module.exports = [
  {
    files: ["src/content.js", "src/popup.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
    },
  },
  {
    files: ["src/background.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.serviceworker,
        ...globals.webextensions,
      },
    },
  },
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
];
