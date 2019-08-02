/*
 * Create and export configuration variables
 */

// Container for all the enviroments
const enviroments = {
  // Staging (default) enviroment
  staging: {
    httpPort: 3000,
    httpsPort: 3001,
    envName: "staging",
    hashingSecret: "thisIsASecret"
  },
  // Production (optional) enviroment
  production: {
    httpPort: 5000,
    httpsPort: 5001,
    envName: "production",
    hashingSecret: "thisIsAlsoASecret"
  }
};

// Determine wether enviroment was passed or not
const passedEnviroment = process.env.NODE_ENV || "staging";

// Set config mode
const currentEnviroment = enviroments[passedEnviroment.toLowerCase()];

// Export the module
module.exports = currentEnviroment;
