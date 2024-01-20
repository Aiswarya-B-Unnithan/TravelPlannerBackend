import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const auth = async (req, res, next) => {
  try {
    // console.log(req.headers);
    const token = req?.headers?.authorization.split(" ")[1];
    const googleToken = token.length > 1000;
    if (googleToken) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      req.user = {
        id: payload.sub,
        name: payload.name,
        photoURL: payload.picture,
        role: "Host",
      };
    } else {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const { userId, name, photoURL, role } = decodedToken;
      // console.log("decodedTokenn",decodedToken)
      req.user = { userId, name, photoURL, role };
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: "Something is wrong with your authorization!",
    });
  }
};

export default auth;
