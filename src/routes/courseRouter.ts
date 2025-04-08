import express, { RequestHandler } from "express";
import { userMiddleware } from "../middleware/userMiddleware";
import { Course, Purchase } from "../server";

const CourseRouter = express.Router();

// preview for all
CourseRouter.get("/preview", async (req, res) => {
  try {
    const courses = await Course.find({});

    if (!courses || courses.length === 0) {
      res.status(404).json({ message: "No courses found" });
      return;
    }

    res.json(courses);
  } catch (error) {
    console.log("previewing course error:", error);
    res.status(500).json({ message: "server error" });
  }
});

//purchase course route
CourseRouter.post("/purchase", userMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const courseId = req.body.courseId;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "courses not found" });
      return;
    }

    //to check existing course
    const existingCourse = await Course.findOne({ userId, courseId });
    if (existingCourse) {
      res.status(400).json({ message: "course already purchased" });
      return;
    }

    const purchase = await Purchase.create({ userId, courseId });
    res
      .status(201)
      .json({ message: "course purchased successfully", purchase });
  } catch (error) {
    console.log("purchase course error :", error);
    res.status(500).json({ message: "internal server error" });
  }
});

export default CourseRouter;
