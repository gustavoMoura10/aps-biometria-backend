const userRoute = require("../app/routes/userRoute");
const authRoute = require("../app/routes/authRoute");

exports.startRouting = (app) => {
  app.use("/user", userRoute);
  app.use("/auth", authRoute);
};
