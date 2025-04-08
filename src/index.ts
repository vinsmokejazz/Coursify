import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import UserRouter from "./routes/userRouter";
import AdminRouter from "./routes/adminRouter";
import CourseRouter from "./routes/courseRouter";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/users", UserRouter);
app.use("/api/v1/admins", AdminRouter);
app.use("/api/v1/courses", CourseRouter);

async function main() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }
    
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main();

