const { Mongoose } = require("mongoose");
const mongoose = new Mongoose();

exports.connection = () => {
  return mongoose.createConnection(process.env.MONGO_URL);
};
exports.authenticate = () => {
  return new Promise((resolve, reject) => {
    mongoose
      .createConnection(process.env.MONGO_URL)
      .on("connected", function () {
        resolve({
          error: false,
          message: "CONNECTED WITH MONGODB",
        });
      });
    mongoose
      .createConnection(process.env.MONGO_URL)
      .on("error", function (err) {
        reject({
          error: true,
          message: err,
        });
      });
  });
};
