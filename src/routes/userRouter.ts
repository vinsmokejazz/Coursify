import express, { Request, Response, RequestHandler } from "express";
import { Course, Purchase, User } from "../server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userMiddleware } from "../middleware/userMiddleware";

const UserRouter = express.Router();

//signin route
const signin: RequestHandler = async (req, res) => {
  const {email,password} = req.body;
  const user = await User.findOne({email});
  if(!user){
    res.status(400).json({message:"user not found"});
    return;
  }
  const isPasswordValid = await bcrypt.compare(password,user.password);
  if(!isPasswordValid){
    res.status(400).json({message:"invalid password"});
    return;
  }
  const token = jwt.sign({userId:user._id},process.env.JWT_USER_SECRET as string);
  res.status(200).json({token, message:"user logged in successfully"});
};

//signup route
const signup: RequestHandler = async (req, res) => {
  const{email,password,firstName,lastName} = req.body;
  const existingUser = await User.findOne({email});
  if(existingUser){
    res.status(400).json({message:"user already exists"});
    return;
  }
  const hashedPassword = await bcrypt.hash(password,10);
  const newUser = await User.create({email,password:hashedPassword,firstName,lastName});
  const token = jwt.sign({userId:newUser._id},process.env.JWT_USER_SECRET as string);
  res.status(201).json({token,message:"user created successfully"});
};

//get purchases route
const getPurchases: RequestHandler = async (req, res) => {
  const userId = req.userId;
  const purchases = await Purchase.find({userId});
  
  if(!purchases || purchases.length === 0){
    res.status(404).json({message:"no purchases found"});
    return;
  }
  
  const courseIds = purchases.map((purchase) => purchase.courseId);
  const courses = await Course.find({_id:{$in:courseIds}});
  
  if(!courses || courses.length === 0){
    res.status(404).json({message:"no courses found"});
    return;
  }
  
  res.status(200).json({courses});
};

//purchase course route
const purchaseCourse: RequestHandler = async (req, res) => {
  const userId = req.userId;
  const { courseId } = req.body;

  if(!courseId){
    res.status(400).json({message:"courseId is required"});
    return;
  }

  const course = await Course.findById(courseId);
  if(!course){
    res.status(404).json({message:"course not found"});
    return;
  }

  // Check if already purchased
  const existingPurchase = await Purchase.findOne({userId, courseId});
  if(existingPurchase){
    res.status(400).json({message:"course already purchased"});
    return;
  }

  // Create purchase
  const purchase = await Purchase.create({userId, courseId});
  res.status(201).json({message:"course purchased successfully", purchase});
};

//routes
UserRouter.post('/signin', signin);
UserRouter.post('/signup', signup);
UserRouter.get('/purchases', userMiddleware, getPurchases);
UserRouter.post('/purchase', userMiddleware, purchaseCourse);

export default UserRouter;