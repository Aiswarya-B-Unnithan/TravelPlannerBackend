const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  Role: {
    type: String,
    default: "Admin",
  },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
