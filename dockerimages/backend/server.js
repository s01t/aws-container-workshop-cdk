const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const uuid = require("uuid");
const XRay = require("aws-xray-sdk");
const AWS = XRay.captureAWS(require('aws-sdk'));

app.set("port", process.env.PORT || 5000);
app.use(bodyParser.json());
app.use(cors());

// Generate logs to the console
const morgan = require("morgan");
const winston = require("winston");
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.combine()
      )
    })
  ]
});

logger.stream = {
  write: function(message) {
    logger.info(message);
  }
};

app.use(morgan("short", { stream: logger.stream }));

// // Enable XRay
// XRay.setLogger(logger);
// XRay.config([XRay.plugins.ECSPlugin]);
// XRay.middleware.enableDynamicNaming();
// app.use(XRay.express.openSegment("backend"));

// Respond on /health route for LB checks
app.use("/health", require("express-healthcheck")());

// Generate DynamoDB Client
const ddbclient = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
    region: process.env.AWS_REGION || "us-west-2"
  });

// Define DynamoDB table name
const tablenanme = "messagestable";

app.get("/messages/", (req, res) => {
  params = {
    TableName: tablenanme
  };

  logger.log("debug", "Trying to get items: " + JSON.stringify(params));

  ddbclient
    .scan(params)
    .promise()
    .then(data => {
      logger.log("info", "Scanned items: " + JSON.stringify(params));
      res.send(data.Items);
    })
    .catch(err => {
      logger.log("error", err);
      res.send([]);
    });
});

app.get("/messages/:messageId/", (req, res) => {
  params = {
    TableName: tablenanme,
    KeyConditionExpression: "id = :i",
    ExpressionAttributeValues: {
      ":i": req.params.messageId
    }
  };

  logger.log("debug", "Trying to get item: " + JSON.stringify(params));

  ddbclient
    .query(params)
    .promise()
    .then(data => {
      logger.log("info", "Queried item: " + JSON.stringify(params));
      res.send(data.Items);
    })
    .catch(err => {
      logger.log("error", err);
      res.send([]);
    });
});

app.post("/messages", (req, res, next) => {
  params = {
    TableName: tablenanme,
    Item: {
      id: uuid.v4(),
      user: req.body.user,
      text: req.body.text
    }
  };

  logger.log("debug", "Trying to put item: " + JSON.stringify(params));

  ddbclient
    .put(params)
    .promise()
    .then(data => {
      logger.log("info", "Created item: " + JSON.stringify(params));
      res.send([]);
    })
    .catch(err => {
      logger.log("error", err);
      res.send([]);
    });
});

app.delete("/messages/:messageId/", (req, res) => {
  var seg = XRay.getSegment();
  seg.addAnnotation("service", "backend-delete");

  params = {
    TableName: tablenanme,
    Key: {
      id: req.params.messageId
    }
  };

  logger.log("debug", "Trying to delete item: " + JSON.stringify(params));

  ddbclient
    .delete(params)
    .promise()
    .then(data => {
      logger.log("info", "Deleted item: " + JSON.stringify(params));
      res.send([]);
    })
    .catch(err => {
      logger.log("error", err);
      res.send([]);
    });
});

// // Enable XRay
// app.use(XRay.express.closeSegment());

app.listen(app.get("port"), () => {
  logger.log("info", "API server is running on PORT: " + app.get("port"));
});

module.exports = app;
