// This file serves as a serverless function entry point for Vercel
const app = require('../server.js');

module.exports = (req, res) => {
  // Forward the request to our Express app
  return app(req, res);
};
