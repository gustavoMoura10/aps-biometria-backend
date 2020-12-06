const { saveValidation } = require("../validators/userValidation");
const ImageKit = require("imagekit");
const User = require("../models/User");

const imagekit = new ImageKit({
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  urlEndpoint: process.env.URL_IMAGES,
});
exports.saveUser = async (req, resp, next) => {
  let status = 400;
  try {
    const errors = await saveValidation(req.body, req.headers);
    delete req.body.confirmPassword;
    if (Object.keys(errors).length > 0) throw errors;
    status = 500;
    let arrayURLs = [];
    for (let photos of req.body.photos) {
      const upload = await imagekit.upload({
        file: photos,
        fileName: `photo_${new Date().getTime()}.png`,
      });
      arrayURLs.push(upload.url);
    }
    req.body.photos = arrayURLs;
    const upload = await imagekit.upload({
      file: req.body.fingerprint,
      fileName: `fingerprint_${new Date().getTime()}.png`,
    });
    req.body.fingerprint = upload.url;
    const user = await (await User.create(req.body)).toJSON();
    delete user.password;
    status = 200;
    return resp.status(status).json(user);
  } catch (error) {
    console.log(error);
    return resp
      .status(status)
      .send(
        status === 500 ? { error: true, message: "Error on Server" } : error
      );
  }
};
exports.findAllUsers = async (req, resp, next) => {
  let status = 400;
  try {
    status = 500;
    const users = await User.find({
      email: { $not: { $regex: process.env.MASTER_EMAIL } },
    }).select("-password");
    status = 200;
    return resp.status(status).json(users);
  } catch (error) {
    console.log(error);
    return resp
      .status(status)
      .send(
        status === 500 ? { error: true, message: "Error on Server" } : error
      );
  }
};

exports.deleteUser = async (req, resp, next) => {
  try {
    if (!req.params._id) throw { params: ["Missing _id"] };
    status = 500;
    const users = await User.findByIdAndDelete(req.params._id);
    status = 200;
    return resp.status(status).json(users);
  } catch (error) {
    console.log(error);
    return resp
      .status(status)
      .send(
        status === 500 ? { error: true, message: "Error on Server" } : error
      );
  }
};
