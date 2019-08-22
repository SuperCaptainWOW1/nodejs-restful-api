/*
 * Primary file of API
 *
 */

// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./lib/config");
const fs = require("fs");
const handlers = require("./lib/handlers");
const helpers = require("./lib/helpers");

// @TODO get rid of this
helpers.sendTwilioSms("4158375309", "Hello!", err => {
  console.log("this was the error " + err);
});

// Instantiate the HTTP  server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

// Start the server
httpServer.listen(config.httpPort, () => {
  console.log(`The http server is listening on port ${config.httpPort}`);
});

// Instantiate the HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem")
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
  console.log(`The https server is listening on port ${config.httpsPort}`);
});

// All the server logic for both the http and https server
function unifiedServer(req, res) {
  // Get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  // Get query string as an object
  const queryStringObject = parsedUrl.query;

  // Get http method
  const method = req.method.toLowerCase();

  // Get the headers
  const headers = req.headers;

  // Get the payload, if any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  req.on("data", data => {
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();

    // Choose the handler this request should go to or not found
    const chosenHandler = router[trimmedPath]
      ? router[trimmedPath]
      : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.parseJSONToObject(buffer)
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode = 200, payload = {}) => {
      // Convert the payload to a string
      let payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the request path
      console.log(
        "Returning response:\n",
        "statusCode: " + statusCode + "\n",
        "payloadString: " + payloadString
      );
    });
  });
}

// Define a request router
const router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks
};
