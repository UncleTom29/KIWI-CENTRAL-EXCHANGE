const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    imgPath: { type: String },
    imgName: { type: String },
    occupation: { type: String },
    adress: { type: String },
    city: { type: String },
    country: { type: String },
    postalCode: { type: String },
    about: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
