const CommonMiddleware = require("./commonMiddle.js");

const Middleware = app => {
  CommonMiddleware(app);
};

module.exports = Middleware;