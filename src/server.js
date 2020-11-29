const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();

const { authenticate } = require("./config/database");
const { startRouting } = require("./config/routes");
const { startMiddlewares } = require("./config/middlewares");

(async () => {
  try {
    const auth = await authenticate();
    console.log(auth);
    console.log(process.env.JWT_TOKEN)
    console.log(process.env.URL_IMAGES)
    startMiddlewares(app);
    startRouting(app);
    app.use("/models", express.static("models"));
  } catch (error) {
    console.log(error);
  }

  app.listen(process.env.PORT, () => {
    console.log(`RUNNING ON PORT:${process.env.PORT}`);
  });
})();
