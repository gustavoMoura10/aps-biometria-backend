const tfnd = require("@tensorflow/tfjs-node");
const canvas = require("canvas");
const bcrypt = require("bcryptjs");
const { LabeledFaceDescriptors, FaceMatcher } = require("face-api.js");
const faceapi = require("face-api.js");
const path = require("path");
const User = require("../models/User");
const Validator = require("validatorjs");
const PNG = require("pngjs").PNG;
const lookSame = require("looks-same");
const jimp = require("jimp");
const { data } = require("@tensorflow/tfjs-node");
const { default: fetch } = require("node-fetch");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const rules = {
  email: "email|required",
  password: "string|required",
  image: "string|required",
};
exports.loginValidation = async (body, type) => {
  let errors = {};
  const validator = new Validator(body, rules);
  if (validator.fails()) {
    errors = { ...errors, ...validator.errors.errors };
  }
  const user = await User.findOne({ email: body.email });
  if (user) {
    const jsonUser = await user.toJSON();
    const compare = bcrypt.compareSync(body.password, jsonUser.password);
    if (!compare) {
      errors["password"] = errors["password"]
        ? [...errors["password"], "Wrong password"]
        : ["Wrong password"];
    }
    if (body.image) {
      if (body.email !== process.env.MASTER_EMAIL) {
        const detection =
          type === "face"
            ? await adminDetectionFace(body.image, await user.toJSON())
            : await adminDetectionFingerprint(body.image, await user.toJSON());
        if (detection) {
          errors["image"] = errors["image"]
            ? [...errors["image"], "User image doesn't match"]
            : ["User image doesn't match"];
        }
      }
    }
  } else {
    errors["email"] = errors["email"]
      ? [...errors["email"], "User with that email not found"]
      : ["User with that email not found"];
  }

  return errors;
};
async function adminDetectionFingerprint(image, user) {
  const data = image.replace(/^data:image\/\w+;base64,/, "");
  const request = await fetch(user.fingerprint);
  const rBuffer = await request.buffer();
  const b1 = await (await jimp.read(Buffer.from(data, "base64")))
    .grayscale()
    .resize(256, 256)
    .getBufferAsync(jimp.MIME_PNG);
  const b2 = await (await jimp.read(rBuffer))
    .grayscale()
    .resize(256, 256)
    .getBufferAsync(jimp.MIME_PNG);
  const result = await new Promise((resolve, reject) => {
    lookSame(b1, b2, { tolerance: 5 }, function (err, { equal }) {
      if (err) {
        reject(err);
      } else {
        resolve(equal);
      }
    });
  });
  return !result;
}
async function adminDetectionFace(image, user) {
  await faceapi.nets.faceRecognitionNet.loadFromDisk(
    path.join(__dirname, "..", "learning")
  );
  await faceapi.nets.faceLandmark68Net.loadFromDisk(
    path.join(__dirname, "..", "learning")
  );
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(
    path.join(__dirname, "..", "learning")
  );
  const canvasPhotos = await Promise.all(
    user.photos.map((el) => canvas.loadImage(el))
  );
  const results = await Promise.all(
    canvasPhotos.map((el) =>
      faceapi.detectSingleFace(el).withFaceLandmarks().withFaceDescriptor()
    )
  );
  const faceMatcher = new FaceMatcher(results, 0.6);
  const imageSent = await faceapi
    .detectSingleFace(await canvas.loadImage(image))
    .withFaceLandmarks()
    .withFaceDescriptor();
  const match = faceMatcher.findBestMatch(imageSent.descriptor);
  return match.toString().includes("unknown");
}
