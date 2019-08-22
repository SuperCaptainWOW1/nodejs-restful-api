/*
 * Helpers for various tasks
 *
 */

// Dependencies
const crypto = require("crypto");
const config = require("./config");
const https = require("https");
const queryString = require("querystring");

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
  },
  // Send an SMS message via twilio
  sendTwilioSms(phone, msg, cb) {
    // Validate parametres
    phone =
      typeof phone == "string" && phone.trim().length == 10
        ? phone.trim()
        : false;
    msg =
      typeof msg == "string" &&
      msg.trim().length > 1 &&
      msg.trim().length <= 1600
        ? msg.trim()
        : false;

    if (phone && msg) {
      // Configure the request payload
      const payload = {
        From: config.twilio.fromPhone,
        To: "+1" + phone,
        Body: msg
      };

      // Stringify the payload
      const stringPayload = queryString.stringify(payload);

      // Configure the request details
      var requestDetails = {
        protocol: "https:",
        hostname: "api.twilio.com",
        method: "POST",
        path:
          "/2010-04-01/Accounts/" + config.twilio.accountSid + "/Messaged.json",
        auth: config.twilio.accountSid + ":" + config.twilio.authToken,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(stringPayload)
        }
      };

      // Instantiate the request object
      const req = https.request(requestDetails, res => {
        // Grab the status of the sent request
        const status = res.statusCode;
        // Callback successfully if the request went through
        if (status == 200 || status == 201) {
          cb(false);
        } else {
          cb("Status code returned was " + status);
        }
      });

      // Bind to the error event event so it doesn't get thrown
      req.on("error", e => {
        cb(e);
      });

      // Add the payload
      req.write(stringPayload);

      // End the request
      req.end();
    } else {
      cb("Given parametres were missing or invalid");
    }
  }
};

module.exports = helpers;
