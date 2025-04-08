import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import UserRouter from "./routes/userRouter";
import AdminRouter from "./routes/adminRouter";
import CourseRouter from "./routes/courseRouter";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/users", UserRouter);
app.use("/api/v1/admins", AdminRouter);
app.use("/api/v1/courses", CourseRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
