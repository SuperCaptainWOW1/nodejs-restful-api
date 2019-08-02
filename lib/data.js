/*
 *	Library for storing and editing data
 *
 */

// Dependencies
const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");

// Container for the module (to export)
const lib = {
  create(dir, file, data, callback) {
    // Open the file for writing
    fs.open(
      `${this.baseDir}${dir}/${file}.json`,
      "wx",
      (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
          // Convert data to string
          let stringData = JSON.stringify(data);

          // Write to file and close it
          fs.writeFile(fileDescriptor, stringData, err => {
            if (!err) {
              fs.close(fileDescriptor, err => {
                if (!err) {
                  callback(false);
                } else {
                  callback("Error closing new file");
                }
              });
            } else {
              callback("Error writing to file");
            }
          });
        } else {
          callback("Could not create new file, it may already exist");
        }
      }
    );
  },
  read(dir, file, callback) {
    fs.readFile(`${this.baseDir}${dir}/${file}.json`, "utf-8", (err, data) => {
      if (!err && data) {
        const parsedData = helpers.parseJSONToObject(data);

        callback(false, parsedData);
      } else {
        callback(err, data);
      }
    });
  },
  update(dir, file, newData, callback) {
    // Open the file for writing
    fs.open(
      `${this.baseDir}${dir}/${file}.json`,
      "r+",
      (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
          const stringData = JSON.stringify(newData);

          // Truncate the file
          fs.ftruncate(fileDescriptor, err => {
            if (!err) {
              // Write to the file and close it
              fs.writeFile(fileDescriptor, stringData, err => {
                if (!err) {
                  fs.close(fileDescriptor, err => {
                    if (!err) {
                      callback(false);
                    } else {
                      callback("Error closing the file");
                    }
                  });
                } else {
                  callback("Error writing the file");
                }
              });
            } else {
              callback("Error truncating the file");
            }
          });
        } else {
          callback(
            "Could not open the file for updating, it may not exist yet"
          );
        }
      }
    );
  },
  delete(dir, file, callback) {
    // Unlink the file
    fs.unlink(`${this.baseDir}${dir}/${file}.json`, err => {
      if (!err) {
        callback(false);
      } else {
        callback("Error deleting the file");
      }
    });
  }
};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, "/../.data/");

// Export module
module.exports = lib;
