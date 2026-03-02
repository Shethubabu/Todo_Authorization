import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import AuthModel from "../models/Auth";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { generateDeviceId } from "../utils/device";

const MAX_DEVICES = 3;

interface ExtendedRequest extends Request {
  ip: string; 
}


export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password required" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    res.status(201).json({ message: "User registered successfully", userId: user._id });
  } catch (error) {
    next(error);
  }
};


export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const ipAddress = req.ip || req.connection.remoteAddress || "";
    const deviceId = generateDeviceId(req.headers["user-agent"] || "", ipAddress);

    const existingSessions = await AuthModel.find({ userId: user._id });

    const accessToken = generateAccessToken({ userId: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id, role: user.role });

    const existingDevice = await AuthModel.findOne({ userId: user._id, deviceId });

    if (existingDevice) {
      existingDevice.refreshToken = refreshToken;
      await existingDevice.save();
    } else {
      if (existingSessions.length >= MAX_DEVICES) {
        res.status(403).json({ message: "Maximum device limit reached" });
        return;
      }

      await AuthModel.create({
        userId: user._id,
        refreshToken,
        deviceId,
        userAgent: req.headers["user-agent"],
        ipAddress,
      });
    }

    res.json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};


export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token required" });
      return;
    }

    const decoded: any = verifyRefreshToken(refreshToken);

    const session = await AuthModel.findOne({ userId: decoded.userId, refreshToken });
    if (!session) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    const newRefreshToken = generateRefreshToken({ userId: decoded.userId, role: decoded.role });
    session.refreshToken = newRefreshToken;
    await session.save();

    const newAccessToken = generateAccessToken({ userId: decoded.userId, role: decoded.role });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};


export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token required" });
      return;
    }

    const deleted = await AuthModel.deleteOne({ refreshToken });
    if (deleted.deletedCount === 0) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    res.json({ message: "Logged out successfully from this device" });
  } catch (error) {
    next(error);
  }
};