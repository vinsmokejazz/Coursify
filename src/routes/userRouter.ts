import express, { Request, Response, RequestHandler } from "express";
import { User } from "../server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userMiddleware } from "../middleware/userMiddleware";

const UserRouter = express.Router();

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

const getPurchases: RequestHandler = async (req, res) => {
  // TODO: Implement purchases logic
};

UserRouter.post('/signin', signin);
UserRouter.post('/signup', signup);
UserRouter.get('/purchases', userMiddleware, getPurchases);

export default UserRouter;