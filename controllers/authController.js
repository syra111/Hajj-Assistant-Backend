import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createFreeSubscription } from "./subscriptionController.js";

export const register = async (req, res) => {
  try {
    const { fullName, email, password, country, preferredLanguage } = req.body;

    if (!fullName || !email || !password || !country || !preferredLanguage) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
    fullName,              
      email,
      password: hashedPassword,
      country,
      preferredLanguage,
      role: "user",
    });
    await createFreeSubscription(newUser._id);

   
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    res.cookie("token", token, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

res.status(201).json({
  message: "User registered successfully",
  token,
  user: {
    id: newUser._id,
    fullName: newUser.fullName,
    email: newUser.email,
  },
});
} catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
