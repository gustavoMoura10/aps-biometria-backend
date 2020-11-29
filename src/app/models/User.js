const { Schema } = require("mongoose");
const { connection } = require("../../config/database");
const bcryptjs = require("bcryptjs");

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  photos: [
    {
      type: String,
      required: true,
    },
  ],
  fingerprint: {
    type: String,
    required: true,
  },
  access: {
    type: String,
    required: true,
    enum: ["ASSESSOR", "SECRETARIO", "MINISTRO"],
  },
});

userSchema.pre("save", function (next) {
  const salt = bcryptjs.genSaltSync(10);
  this.password = bcryptjs.hashSync(this.password, salt);
  next();
});

module.exports = connection().model("User", userSchema, "user");
