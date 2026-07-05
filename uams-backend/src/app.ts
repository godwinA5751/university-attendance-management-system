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

app.use("/api/auth", authRoutes);

app.use("/api/students", studentRoutes);
app.use("/api/lecturers", lecturerRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/academic-sessions", academicSessionRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/course-assignment", courseAssignmentRoutes);
app.use("/api/analytics", analyticsRoutes);


export default app;