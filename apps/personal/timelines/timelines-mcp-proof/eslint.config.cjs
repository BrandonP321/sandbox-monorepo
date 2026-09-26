const { baseConfig } = require("@repo/config-eslint");
module.exports = [...baseConfig, { ignores: ["plugins/**/dist/**"] }];
