/*
 * Helpers for various tasks
 *
 */

// Dependencies
const crypto = require("crypto");
const config = require("./config");

// Container for all the helpers
const helpers = {
  // Create a SHA256 hash
  hash(str) {
    if (typeof str === "string" && str.length > 0) {
      const hash = crypto
        .createHmac("sha256", config.hashingSecret)
        .update(str)
        .digest("hex");
      return hash;
    } else {
      return false;
    }
  },
  // Parse a JSON string in all cases without throwing an error
  parseJSONToObject(str) {
    try {
      const obj = JSON.parse(str);
      return obj;
    } catch {
      return {};
    }
  },
  // Create a string of random alphanumerical characters, of a given length
  createRandomString(len) {
    len = typeof len == "number" && len > 0 ? len : false;
    if (len) {
      // Define all the possible characters that can go in to string

      const possibleCharacters = "abcdefghijkmnlopqrstuvwxyz0123456789";

      // Start the final string
      let str = "";

      for (let i = 0; i < len; i++) {
        let randomCharacter = possibleCharacters.charAt(
          Math.floor(Math.random() * possibleCharacters.length)
        );
        str += randomCharacter;
      }

      // return the final string
      return str;
    } else {
      return false;
    }
  }
};

module.exports = helpers;
