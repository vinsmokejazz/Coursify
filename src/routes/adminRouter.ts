import express from "express";
import { Admin } from "../server";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

const AdminRouter = express.Router();

AdminRouter.post('/signup',async (req,res)=>{

  try{
    const {email,password,firstName,lastName}=req.body;
    const existingAdmin= await Admin.findOne({email});
    if(existingAdmin){
      res.status(400).json({message:"admin already exists"})
      return;
    }
    const hashedPassword=await bcrypt.hash(password,10);
    await Admin.create({email,password:hashedPassword,firstName,lastName});

    const token=jwt.sign({adminId:newAdmin._id},process.env.JWT_ADMIN_SECRET) as string
    res.status(200).json({token,message:"admin created successfully"})
  } catch(error){
    console.log(error)
    res.status(500).json({message:"server error"})

  }
})

AdminRouter.post('/login',async(req,res)=>{
  try{
    const{email,password}=req.body;
    const admin= await Admin.findOne({email,password});
    if(!admin){
      res.status(400).json({message:"admin not found"})
      return;
    }
    const isPasswordValid= await bcrypt.compare(password,admin?.password);
    if(!isPasswordValid){
      res.status(401).json({message:"incorrect password"});
      return;
    }
    
    const token=jwt.sign({adminId:newAdmin._id},process.env.JWT_ADMIN_SECRET) as string
    res.status(200).json({token,message:"admin logged in successfully"})
  } catch(error){
    console.log(error)
    res.status(500).json({message:"server error"})
  }

})

AdminRouter.post('/courses',(req,res)=>{
  //create course
})

AdminRouter.put('/courses/:courseId',(req,res)=>{

})

AdminRouter.get('/courses',(req,res)=>{

})

export default AdminRouter;
