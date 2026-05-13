const { reactConfig } = require("@repo/config-eslint");

module.exports = [
  ...reactConfig,
  {
    ignores: ["storybook-static/**"]
  }
];
