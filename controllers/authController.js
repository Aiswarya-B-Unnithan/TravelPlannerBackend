import Users from "../models/userModel.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

export const register = async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Validate fields
  if (!(firstName || lastName || email || password || role)) {
    return res.status(400).json({ message: "Please Provide Required Fields" });
    return;
  }

  try {
    const userExist = await Users.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: "Mail Address already exists" });
    }

    const hashedPassword = await hashString(password);

    // Get the latest user to determine the next uId
    const latestUser = await Users.findOne().sort({ uId: -1 });
    let nextUId = 1;

    if (latestUser && latestUser.uId) {
      // Extract the number from the current uId and increment by 1
      nextUId = parseInt(latestUser.uId.slice(1)) + 1;
    }

    // Format the nextUId with leading zeros
    const formattedUId = `U${nextUId.toString().padStart(3, "0")}`;

    const user = await Users.create({
      firstName,
      lastName,
      email,
      role,
      password: hashedPassword,
      uId: formattedUId,
    });

    // send email verification to user
    sendVerificationEmail(user, res);
  } catch (error) {
    console.log(error);
    res.status(404).json({ success: false, message: error.message });
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    //validation
    if (!email || !password) {
      return res
        .status(404)
        .json({ success: false, message: "Please Provide User Credentials" });
    }

    // find user by email
    const user = await Users.findOne({ email }).select("+password").populate({
      path: "friends",
      select: "firstName lastName location profileUrl -password",
    });
    // console.log("userrrrrr", user);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password,",
      });
    }

    if (user.role === "Admin") {
      user.password = undefined;

      const token = createJWT(
        user?._id,
        user.firstName,
        user?.profileUrl,
        user?.role
      );

      return res.status(201).json({
        success: true,
        message: "Login successfully",
        user,
        token,
      });
    }
    if (!user?.verified) {
      return res.status(400).json({
        success: false,
        message:
          "User email is not verified. Check your email account and verify your email,",
      });
    }

    // compare password
    const isMatch = await compareString(password, user?.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password,",
      });
    }
    if (user.Active === false)
      return res.status(400).json({
        success: false,
        message: "This account has been suspended! Try to contact the admin",
      });
    user.password = undefined;

    const token = createJWT(
      user?._id,
      user.firstName,
      user?.profileUrl,
      user?.role
    );

    res.status(201).json({
      success: true,
      message: "Login successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
