import mongoose, { Schema } from "mongoose";

function passwordValidator() {
  const isGoogleAuth = this.isGoogleAuth || false;

  // Check if the document is being updated and isGoogleAuth is false
  if (
    !this.isNew &&
    !isGoogleAuth &&
    (!this.password || this.password.length < 6)
  ) {
    this.invalidate(
      "password",
      "Password is required and should be at least 6 characters long."
    );
  }
}
//schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is Required!"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name is Required!"],
    },
    email: {
      type: String,
      required: [true, " Email is Required!"],
      unique: true,
    },
    password: {
      type: String,
      select: true,
      validate: {
        validator: passwordValidator,
        message:
          "Custom password validation failed. Password is required and should be at least 6 characters long.",
      },
    },
    uId: {
      type: String,
      unique: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    socialMediaLinks: {
      type: [
        {
          platform: {
            type: String,
            enum: ["Instagram", "Facebook", "Twitter", "LinkedIn", "Other"],
            required: true,
          },
          link: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    travelPreference: {
      type: String,
      default: "",
    },
    profileViews: [
      {
        viewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Traveler",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    location: { type: String },
    profileUrl: { type: String },
    profession: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: "Users" }],

    verified: { type: Boolean, default: false },
    isGoogleAuth: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Traveler", "Host", "Admin"],
      default: "Traveler",
    },
    Active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
// Conditionally add adminVerification field if the role is "Host"
if (userSchema.path("role").enumValues.includes("Host")) {
  userSchema.add({
    adminVerification: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  });
}
// Create the model based on the modified schema
const Users = mongoose.model("Users", userSchema);

export default Users;
