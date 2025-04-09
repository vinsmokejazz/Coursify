import express, { Request, Response } from "express";
import { Admin, Course } from "../server";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import { adminMiddleware } from "../middleware/adminMiddleware";

const AdminRouter = express.Router();

// Declare the adminId property on Express Request type
declare global {
  namespace Express {
    interface Request {
      adminId: string;
    }
  }
}

interface AdminSignupBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AdminLoginBody {
  email: string;
  password: string;
}

interface CourseCreateBody {
  title: string;
  description: string;
  image: string;
  price: number;
}

type SignupRequest = Request<{}, {}, AdminSignupBody>;
type LoginRequest = Request<{}, {}, AdminLoginBody>;
type CourseRequest = Request<{}, {}, CourseCreateBody>;
type UpdateCourseRequest = Request<{ courseId: string }, {}, Partial<CourseCreateBody>>;
type GetCoursesRequest = Request;

const signupHandler = async (req: SignupRequest, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(400).json({ message: "Admin already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({ email, password: hashedPassword, firstName, lastName });

    if (!process.env.JWT_ADMIN_SECRET) {
      throw new Error('JWT_ADMIN_SECRET is not defined');
    }
    const token = jwt.sign({ adminId: newAdmin._id }, process.env.JWT_ADMIN_SECRET);
    res.status(200).json({ token, message: "Admin created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginHandler = async (req: LoginRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    
    if (!process.env.JWT_ADMIN_SECRET) {
      throw new Error('JWT_ADMIN_SECRET is not defined');
    }
    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_ADMIN_SECRET);
    res.status(200).json({ token, message: "Admin logged in successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createCourseHandler = async (req: CourseRequest, res: Response): Promise<void> => {
  try {
    const { title, description, image, price } = req.body;
    
    if (!title || !description || !image || !price) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (typeof price !== 'number' || price < 0) {
      res.status(400).json({ message: "Price must be a positive number" });
      return;
    }

    const newCourse = await Course.create({
      title,
      description,
      adminId: req.adminId,
      image,
      price
    });

    res.status(201).json({
      message: "Course created successfully",
      courseId: newCourse._id
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateCourseHandler = async (req: UpdateCourseRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    const { title, description, image, price } = req.body;

    const course = await Course.findOne({ _id: courseId, adminId: req.adminId });
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { title, description, image, price },
      { new: true }
    );

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCoursesHandler = async (req: GetCoursesRequest, res: Response): Promise<void> => {
  try {
    const courses = await Course.find({ adminId: req.adminId });
    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

AdminRouter.post('/signup', signupHandler);
AdminRouter.post('/login', loginHandler);
AdminRouter.post('/courses', adminMiddleware, createCourseHandler);
AdminRouter.put('/courses/:courseId', adminMiddleware, updateCourseHandler);
AdminRouter.get('/courses', adminMiddleware, getCoursesHandler);

export default AdminRouter;
