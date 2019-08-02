/*
 * Request handlers
 *
 */

// Dependencies
const _data = require("./data");
const helpers = require("./helpers");

// Define the handlers
const handlers = {
  users(data, cb) {
    const acceptableMethods = ["post", "get", "put", "delete"];
    if (acceptableMethods.indexOf(data.method) !== -1) {
      handlers._users[data.method](data, cb);
    } else {
      cb(405);
    }
  },
  // Container for the users submethods
  _users: {
    // Users - post
    // Required data: fitstName, lastName, phone, password, tosAgreement
    // Optional data: none
    post(data, cb) {
      // Check that all required fields are filled out
      const firstName =
        typeof data.payload.firstName === "string" &&
        data.payload.firstName.trim().length > 0
          ? data.payload.firstName.trim()
          : false;
      const lastName =
        typeof data.payload.lastName === "string" &&
        data.payload.lastName.trim().length > 0
          ? data.payload.lastName.trim()
          : false;
      const phone =
        typeof data.payload.phone === "string" &&
        data.payload.phone.trim().length == 10
          ? data.payload.phone.trim()
          : false;
      const password =
        typeof data.payload.password === "string" &&
        data.payload.password.trim().length > 0
          ? data.payload.password.trim()
          : false;
      const tosAgreement =
        typeof data.payload.tosAgreement === "boolean"
          ? data.payload.tosAgreement
          : false;

      if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesn't already exist
        _data.read("users", phone, (err, data) => {
          if (err) {
            // Hash the password
            const hashedPassword = helpers.hash(password);

            if (hashedPassword) {
              // Create the user object
              const userObject = {
                firstName,
                lastName,
                phone,
                hashedPassword,
                tosAgreement: true
              };

              // Store the user
              _data.create("users", phone, userObject, err => {
                if (!err) {
                  cb(200);
                } else {
                  console.log(err);
                  cb(500, { Error: "Could not create the new user" });
                }
              });
            } else {
              cb(500, { Error: "Could not hash the users password" });
            }
          } else {
            // User alredy exist
            cb(400, { Error: "A user with that phone number already exists" });
          }
        });
      } else {
        cb(400, { Error: "Missing required fields" });
      }
    },
    // Users - get
    // Required data: phone
    // Optional data: none
    get(data, cb) {
      // Check that phone number provided is valid
      const phone =
        typeof data.queryStringObject.phone == "string" &&
        data.queryStringObject.phone.trim().length == 10
          ? data.queryStringObject.phone.trim()
          : false;

      if (phone) {
        // Get the token from the headers
        const token =
          typeof data.headers.token == "string" ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, tokenIsValid => {
          if (tokenIsValid) {
            // Lookup the user
            _data.read("users", phone, (err, data) => {
              if (!err && data) {
                // Remove the hashed password from the user object before returning it to requestor
                delete data.hashedPassword;
                cb(200, data);
              } else {
                cb(404);
              }
            });
          } else {
            cb(403, {
              Error: "Missing required token in header or token is invalid"
            });
          }
        });
      } else {
        cb(400, { Error: "Missing required field" });
      }
    },
    // Users - put
    // Required fields: phone
    // Optional data: firstName, lastName, password (at least one must be specified)
    put(data, cb) {
      // Check for the reqired field
      const phone =
        typeof data.payload.phone == "string" &&
        data.payload.phone.trim().length == 10
          ? data.payload.phone.trim()
          : false;

      // Check for the optional fields
      const firstName =
        typeof data.payload.firstName === "string" &&
        data.payload.firstName.trim().length > 0
          ? data.payload.firstName.trim()
          : false;
      const lastName =
        typeof data.payload.lastName === "string" &&
        data.payload.lastName.trim().length > 0
          ? data.payload.lastName.trim()
          : false;
      const password =
        typeof data.payload.password === "string" &&
        data.payload.password.trim().length > 0
          ? data.payload.password.trim()
          : false;

      // Error if the phone is invalid
      if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
          // Get the token from the headers
          const token =
            typeof data.headers.token == "string" ? data.headers.token : false;

          // Verify that the given token is valid for the phone number
          handlers._tokens.verifyToken(token, phone, tokenIsValid => {
            if (tokenIsValid) {
              // Lookup the user
              _data.read("users", phone, (err, userData) => {
                if (!err && userData) {
                  // Update the fields necessary
                  if (firstName) {
                    userData.firstName = firstName;
                  }
                  if (lastName) {
                    userData.lastName = lastName;
                  }
                  if (password) {
                    userData.hashedPassword = helpers.hash(password);
                  }

                  // Store the new updates
                  _data.update("users", phone, userData, err => {
                    if (!err) {
                      cb(200);
                    } else {
                      console.log(err);
                      cb(500, { Error: "Could not update the user" });
                    }
                  });
                } else {
                  cb(400, { Error: "User doesn't exist" });
                }
              });
            } else {
              cb(403, {
                Error: "Missing required token in header or token is invalid"
              });
            }
          });
        } else {
          cb(400, { Error: "Missing fields to update" });
        }
      } else {
        cb(400, { Error: "Missing required field" });
      }
    },
    // Users - delete
    // Required field: phone
    // Optional fields: none
    // @TODO cleanup (delete) any other data files associated with this user
    delete(data, cb) {
      // Check that phone number provided is valid
      const phone =
        typeof data.queryStringObject.phone == "string" &&
        data.queryStringObject.phone.trim().length == 10
          ? data.queryStringObject.phone.trim()
          : false;

      if (phone) {
        // Get the token from the headers
        const token =
          typeof data.headers.token == "string" ? data.headers.token : false;

        handlers._tokens.verifyToken(token, phone, tokenIsValid => {
          if (tokenIsValid) {
            // Lookup the user
            _data.read("users", phone, (err, data) => {
              if (!err && data) {
                _data.delete("users", phone, err => {
                  if (!err) {
                    cb(200);
                  } else {
                    cb(500, { Error: "Could not delete the specified user" });
                  }
                });
              } else {
                cb(400, { Error: "Could not find the specified user" });
              }
            });
          } else {
            cb(403, {
              Error: "Missing required token in header or token is invalid"
            });
          }
        });
      } else {
        cb(400, { Error: "Missing required field" });
      }
    }
  },
  tokens(data, cb) {
    const acceptableMethods = ["post", "get", "put", "delete"];
    if (acceptableMethods.indexOf(data.method) !== -1) {
      handlers._tokens[data.method](data, cb);
    } else {
      cb(405);
    }
  },
  // Container for all the tokens methods
  _tokens: {
    // Tokens - post
    // Required data: phone, password
    // Optional data: none
    post(data, cb) {
      // Check that all required data are filled out
      const phone =
        typeof data.payload.phone === "string" &&
        data.payload.phone.trim().length == 10
          ? data.payload.phone.trim()
          : false;
      const password =
        typeof data.payload.password === "string" &&
        data.payload.password.trim().length > 0
          ? data.payload.password.trim()
          : false;

      if (phone && password) {
        // Lookup the user who matches that phone number
        _data.read("users", phone, (err, userData) => {
          if (!err && userData) {
            // Hash the sent password and compare it to the password in the user object
            const hashedPassword = helpers.hash(password);
            if (hashedPassword == userData.hashedPassword) {
              // If valid, create a new token with a random name. Set expiration date 1 hour in the future
              const tokenId = helpers.createRandomString(20);

              const expires = Date.now() + 1000 * 60 * 60;
              const tokenObject = {
                phone,
                id: tokenId,
                expires
              };

              // Store the token
              _data.create("tokens", tokenId, tokenObject, err => {
                if (!err) {
                  cb(200, tokenObject);
                } else {
                  cb(500, { Error: "Coud not create the new token" });
                }
              });
            } else {
              cb(400, { Error: "Password did not match the specified user" });
            }
          } else {
            cb(400, { Error: "Could not find a specified user" });
          }
        });
      } else {
        cb(400, { Error: "Missing required fields" });
      }
    },
    // Tokens - get
    // Required data: id
    // Optional data: none
    get(data, cb) {
      // Check if the id is valid
      const id =
        typeof data.queryStringObject.id == "string" &&
        data.queryStringObject.id.trim().length == 20
          ? data.queryStringObject.id.trim()
          : false;

      if (id) {
        // Lookup the user
        _data.read("tokens", id, (err, tokenData) => {
          if (!err && tokenData) {
            cb(200, tokenData);
          } else {
            cb(404);
          }
        });
      } else {
        cb(400, { Error: "Missing required field" });
      }
    },
    // Tokens - put
    // Required data: id, extend
    // Optional data: none
    put(data, cb) {
      const id =
        typeof data.payload.id === "string" &&
        data.payload.id.trim().length == 20
          ? data.payload.id.trim()
          : false;
      const extend =
        typeof data.payload.extend === "boolean" && data.payload.extend == true
          ? true
          : false;

      if (id && extend) {
        _data.read("tokens", id, (err, tokenData) => {
          if (!err && tokenData) {
            // Check to the make sure the token isn't already expired
            if (tokenData.expires > Date.now()) {
              // Set the expiration and hour from now
              tokenData.expires = Date.now() + 1000 * 60 * 60;

              // Store the new updates
              _data.update("tokens", id, tokenData, err => {
                if (!err) {
                  cb(200);
                } else {
                  cb(500, { Error: "Could not update a token expiration" });
                }
              });
            } else {
              cb(400, {
                Error: "The token has already expired and can not be extended"
              });
            }
          } else {
            cb(400, { Error: "Specified token doesn't exist" });
          }
        });
      } else
        [cb(400, { Error: "Missing required fields or fields are invalid" })];
    },
    // Tokens - delete
    // Required data: id
    // Optional data: none
    delete(data, cb) {
      // Check if the id is valid
      const id =
        typeof data.queryStringObject.id == "string" &&
        data.queryStringObject.id.trim().length == 20
          ? data.queryStringObject.id.trim()
          : false;

      if (id) {
        // Lookup the token
        _data.read("tokens", id, (err, tokenData) => {
          if (!err && tokenData) {
            _data.delete("tokens", id, err => {
              if (!err) {
                cb(200);
              } else {
                cb(500, { Error: "Could not delete the token" });
              }
            });
          } else {
            cb(400, { Error: "Could not find the specified token" });
          }
        });
      } else {
        cb(400, { Error: "Missing required field" });
      }
    },
    // Verify if the current token id valid for a given user
    verifyToken(id, phone, cb) {
      // Lookup the token
      _data.read("tokens", id, (err, tokenData) => {
        if (!err && tokenData) {
          // Check that the token is for given user and is not expired
          if (tokenData.phone == phone && tokenData.expires > Date.now()) {
            cb(true);
          } else {
            cb(false);
          }
        } else {
          cb(false);
        }
      });
    }
  },

  ping(data, cb) {
    cb(200);
  },
  // Not found handler
  notFound(data, cb) {
    cb(404);
  }
};

// Export the module
module.exports = handlers;
