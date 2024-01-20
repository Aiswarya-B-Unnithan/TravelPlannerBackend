import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import tryCatch from "./utils/tryCatch.js";
import Room from "../models/Room.js";

// 

export const updateProfile = tryCatch(async (req, res) => {
  const fields = req.body?.photoURL
    ? { name: req.body.name, photoURL: req.body.photoURL }
    : { name: req.body.name };
  const updatedUser = await User.findByIdAndUpdate(req.user.id, fields, {
    new: true,
  });
  const { _id: id, name, photoURL, role } = updatedUser;

  await Room.updateMany({ uid: id }, { uName: name, uPhoto: photoURL });

  const token = jwt.sign({ id, name, photoURL, role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.status(200).json({ success: true, result: { name, photoURL, token } });
});

export const getUsers = tryCatch(async (req, res) => {
  const users = await User.find().sort({ _id: -1 });
  res.status(200).json({ success: true, result: users });
});

export const updateStatus = tryCatch(async (req, res) => {
  const { role, active } = req.body;
  await User.findByIdAndUpdate(req.params.userId, { role, active });
  res.status(200).json({ success: true, result: { _id: req.params.userId } });
});
