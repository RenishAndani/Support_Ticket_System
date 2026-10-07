import { registerUser, loginUser } from "../services/auth.service.js";

import { registerSchema, loginSchema } from "../validators/auth.validator.js";

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const user = await registerUser(data);

    if (user === "exist") {
      res.status(400).json({ message: "email already exist" });
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await loginUser(data);

    if (result === "Invalid") {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (result === "Invalid email or password") {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // Must match your login configuration
      sameSite: "lax",
    });

    res.status(200).json({ message: "logout successfully" });
  } catch (error) {
    next(error);
  }
};
