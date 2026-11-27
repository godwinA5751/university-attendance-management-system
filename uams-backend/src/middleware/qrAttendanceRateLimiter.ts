import rateLimit from "express-rate-limit";

export const qrAttendanceRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many attendance attempts. Please try again in a minute.",
  },
  keyGenerator: (req) => {
    return req.user?.id ?? req.ip ?? "unknown";
  },
});