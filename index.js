// This file serves as an entry point for Vercel serverless functions
// It simply re-exports the Express app from server.js

const app = require('./server.js');

module.exports = app;
