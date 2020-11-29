const jwt = require("jsonwebtoken");
const User = require("../models/User");
exports.auth = async (req, resp, next) => {
  const authorization =
    req.headers["Authorization"] || req.headers["authorization"];
  if (authorization) {
    if (authorization.includes("Bearer ")) {
      const token = authorization.split("Bearer ").pop();
      const payload = jwt.verify(token, process.env.JWT_TOKEN);
      if (payload._id) {
        const user = await User.findById(payload._id);
        console.log(new Date(payload.exp * 1000));
        if (user) {
          if (payload.exp * 1000 > new Date().getTime()) {
            req.headers["user-id"] = payload._id;
            next();
          } else {
            return resp.status(403).send({
              error: true,
              message: "Token expired",
            });
          }
        } else {
          return resp.status(403).send({
            error: true,
            message: "User not found",
          });
        }
      } else {
        return resp.status(401).send({
          error: true,
          message: "Wrong payload",
        });
      }
    } else {
      return resp.status(401).send({
        error: true,
        message: "Wrong authorization sent",
      });
    }
  } else {
    return resp.status(401).send({
      error: true,
      message: "Missing Authorization",
    });
  }
};
