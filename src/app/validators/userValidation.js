const Validator = require("validatorjs");
const User = require("../models/User");
const rules = {
  email: "email|required",
  password: "string|required",
  confirmPassword: "string|required|same:password",
  photos: "array|required",
  fingerprint: "string|required",
  access: "string|required",
};
exports.saveValidation = async (body, headers) => {
  let errors = {};
  const validator = new Validator(body, rules);
  if (validator.fails()) {
    errors = { ...errors, ...validator.errors.errors };
  }
  const user = await User.findOne({ email: body.email });
  if (user) {
    errors["email"] = errors["email"]
      ? [...errors["email"], "User with that email already exists"]
      : ["User with that email already exists"];
  }
  if (body.photos.length !== 3) {
    errors["photos"] = errors["photos"]
      ? [...errors["photos"], "Photos limit is 3"]
      : ["Photos limit is 3"];
  }
  const userSaving = await (await User.findById(headers["user-id"])).toJSON();
  if (userSaving.access === "SECRETARIO" && body.access === "MINISTRO") {
    errors["access"] = errors["access"]
      ? [...errors["access"], "Access denied for this user"]
      : ["Access denied for this user"];
  }
  if (
    userSaving.access === "ASSESSOR" &&
    (body.access === "MINISTRO" || body.access === "SECREARIO")
  ) {
    errors["access"] = errors["access"]
      ? [...errors["access"], "Access denied for this user"]
      : ["Access denied for this user"];
  }
  return errors;
};
