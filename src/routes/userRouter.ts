import express, { Request, Response, RequestHandler } from "express";
import { Course, Purchase, User } from "../server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userMiddleware } from "../middleware/userMiddleware"

const UserRouter = express.Router();

//signup route
const signup: RequestHandler = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "user already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_USER_SECRET as string
    );
    res.status(201).json({ token, message: "user created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//signin route
const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "user not found" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "invalid password" });
      return;
    }
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_USER_SECRET as string
    );
    res.status(200).json({ token, message: "user logged in successfully" });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get purchases route
const getPurchases: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    const purchases = await Purchase.find({ userId });

    if (!purchases || purchases.length === 0) {
      res.status(404).json({ message: "no purchases found" });
      return;
    }

    const courseIds = purchases.map((purchase) => purchase.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } });

    if (!courses || courses.length === 0) {
      res.status(404).json({ message: "no courses found" });
      return;
    }

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Get purchases error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//routes
UserRouter.post("/login", login);
UserRouter.post("/signup", signup);
UserRouter.get("/purchases", userMiddleware, getPurchases);

export default UserRouter;
