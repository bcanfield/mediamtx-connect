const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    // setupNodeEvents: (config) => {
    //   //   require("@cypress/code-coverage/task")(on, config);
    //   return config;
    // },
  },
});
