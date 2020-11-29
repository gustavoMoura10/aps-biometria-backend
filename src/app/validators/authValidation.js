const tfnd = require("@tensorflow/tfjs-node");
const canvas = require("canvas");
const bcrypt = require("bcryptjs");
const { LabeledFaceDescriptors, FaceMatcher } = require("face-api.js");
const faceapi = require("face-api.js");
const path = require("path");
const User = require("../models/User");
const Validator = require("validatorjs");
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
  } else {
    errors["email"] = errors["email"]
      ? [...errors["email"], "User with that email not found"]
      : ["User with that email not found"];
  }

  return errors;
};
async function adminDetectionFingerprint(image, user) {}
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
