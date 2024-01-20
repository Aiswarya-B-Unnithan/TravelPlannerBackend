import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

export const hashString = async (useValue) => {
  const salt = await bcrypt.genSalt(10);

  const hashedpassword = await bcrypt.hash(useValue, salt);
  return hashedpassword;
};

export const compareString = async (userPassword, password) => {
  const isMatch = await bcrypt.compare(userPassword, password);
  return isMatch;
};

//JSON WEBTOKEN
export function createJWT(id, firstName, profileUrl, role) {
  console.log("pu", id);
  return JWT.sign(
    { userId: id, name: firstName, photoURL: profileUrl, role },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
}
