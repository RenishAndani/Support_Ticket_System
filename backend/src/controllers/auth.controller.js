import jwt from "jsonwebtoken";

import { registerUser, loginUser, findUserById } from "../services/auth.service.js";

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

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/api/auth/refresh",
    });

    res.status(200).json({ message: "logout successfully" });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    console.log("come in to refresh");

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found",
      });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: "Invalid or expired refresh token",
        });
      }

      const newAccessToken = jwt.sign(
        {
          userId: decoded.userId,
          role: decoded.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "15m",
        },
      );

      res.cookie("token", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        data: {
          userId: decoded.userId,
          role: decoded.role,
        },
      });
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.userid);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: {
        id: user.userid,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
