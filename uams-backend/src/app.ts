
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
import curriculumRoutes from "./routes/curriculumRoutes.js";

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGINS || "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as server-to-server
      // requests and native clients.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
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
app.use("/curricula", curriculumRoutes);

export default app;