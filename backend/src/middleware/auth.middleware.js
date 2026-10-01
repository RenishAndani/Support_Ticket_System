import jwt from "jsonwebtoken";
import { getUserById } from "../services/auth.service.js";

export const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  console.log(token);

  if (!token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await getUserById(decoded.userId);

  if (!user) {
    return res.status(401).json({
      message: "User no longer exists",
    });
  }

  req.user = user;
  next();
};
