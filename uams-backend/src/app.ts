import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import lecturerRoutes from "./routes/lecturerRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import academicSessionRoutes from "./routes/academicSessionRoutes.js";
import enrollmentRoutes from "./routes/courseEnrollmentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import courseAssignmentRoutes from "./routes/courseAssignmentRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("UAMS API is running 🚀");
});

app.use("/auth", authRoutes);

app.use("/students", studentRoutes);
app.use("/lecturers", lecturerRoutes);
app.use("/courses", courseRoutes);
app.use("/academic-sessions", academicSessionRoutes);
app.use("/enrollments", enrollmentRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/course-assignments", courseAssignmentRoutes);
app.use("/analytics", analyticsRoutes);


export default app;