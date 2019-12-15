const express = require('express');
const consola = require('consola');
const { Nuxt, Builder } = require('nuxt');
const XRay = require('aws-xray-sdk');

const app = express();

// // Enable XRay
// XRay.setLogger(consola);
// XRay.setContextMissingStrategy('LOG_ERROR');
// XRay.config([XRay.plugins.ECSPlugin]);
// XRay.middleware.enableDynamicNaming();
// XRay.captureHTTPsGlobal(require('http'));
// app.use(XRay.express.openSegment('frontend'));

/// Customize Logs
const morgan = require("morgan");
app.use(morgan("short", {stream: consola.stdout}));

// Respond on /health route for LB checks
app.use("/health", require("express-healthcheck")());
///

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js');
config.dev = process.env.NODE_ENV !== 'production';

async function start () {
  // Init Nuxt.js
  const nuxt = new Nuxt(config);

  const { host, port } = nuxt.options.server;

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render);

  // // Enable XRay
  // app.use(XRay.express.closeSegment());

  // Listen the server
  app.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

start();

