const { loginValidation } = require("../validators/authValidation");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
exports.login = async (req, resp, next) => {
  let status = 400;
  try {
    if (!req.params.type) throw { params: ["Missing type login"] };
    const errors = await loginValidation(req.body, req.params.type);
    console.log(Object.keys(errors))
    if (Object.keys(errors).length > 0) throw errors;
    status = 500;
    const user = await (
      await User.findOne({ email: req.body.email }).select("-password")
    ).toJSON();
    const token = jwt.sign(user, process.env.JWT_TOKEN, { expiresIn: "24h" });
    status = 200;
    return resp.status(status).json({ ...user, token });
  } catch (error) {
    console.log(error);
    return resp
      .status(status)
      .send(
        status === 500 ? { error: true, message: "Error on Server" } : error
      );
  }
};
exports.newToken = async (req, resp, next) => {
  let status = 400;
  try {
    status = 500;
    const user = await (
      await User.findById(req.headers["user-id"]).select("-password")
    ).toJSON();
    const token = jwt.sign(user, process.env.JWT_TOKEN, { expiresIn: "24h" });
    status = 200;
    return resp.status(status).json({ ...user, token });
  } catch (error) {
    console.log(error);
    return resp
      .status(status)
      .send(
        status === 500 ? { error: true, message: "Error on Server" } : error
      );
  }
};
