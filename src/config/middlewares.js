const { json } = require("express");
const cors = require("cors");
const morgan = require("morgan");
exports.startMiddlewares = (app) => {
  app.use(json({ limit: "1gb" }));
  app.use(cors());
  app.use(morgan("dev"));
};
