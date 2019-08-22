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
    hashingSecret: "thisIsASecret",
    maxChecks: 5,
    twilio: {
      accountSid: "ACb32d411ad7fe886aac54c665d25e5c5d",
      authToken: "9455e3eb3109edc12e3d8c92768f7a67",
      fromPhone: "+15005550006"
    }
  },
  // Production (optional) enviroment
  production: {
    httpPort: 5000,
    httpsPort: 5001,
    envName: "production",
    hashingSecret: "thisIsAlsoASecret",
    maxChecks: 5,
    twilio: {
      accountSid: "ACb32d411ad7fe886aac54c665d25e5c5d",
      authToken: "9455e3eb3109edc12e3d8c92768f7a67",
      fromPhone: "+15005550006"
    }
  }
};

// Determine wether enviroment was passed or not
const passedEnviroment = process.env.NODE_ENV || "staging";

// Set config mode
const currentEnviroment = enviroments[passedEnviroment.toLowerCase()];

// Export the module
module.exports = currentEnviroment;
