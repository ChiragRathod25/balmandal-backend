import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { logger } from "./utils/logger.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("public"));
app.use(cookieParser());

app.use((req, res, next) => {
  logger.info("Incoming Request", {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      body: req.body,
      ip: req.ip,
  });
  next();
});



app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from the server!" });
});
app.get("/api", (req, res) => {
  res.status(200).json({ message: "Hello from the server!" });
}); 
app.post("/api/v1/logs", (req, res) => {
  console.log("Received log:", req.body);
  const { level, message, timestamp } = req.body;
  logger[level](message, { timestamp });
  res.status(200).json({ message: "Log received" });
});


import userRoutes from "./routes/user.routes.js";
import parentRoutes from "./routes/parent.routes.js";
import achievementRoutes from "./routes/achievement.routes.js";
import talentRoutes from "./routes/talent.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import eventRoutes from "./routes/event.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import unregisteredAttendanceRoutes from "./routes/unregistered_attendance.routes.js";
import postRoutes from "./routes/post.routes.js";
import likeRoutes from "./routes/like.routes.js";
import commentRoutes from "./routes/comment.routes.js";

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/parent", parentRoutes);
app.use("/api/v1/achievement", achievementRoutes);
app.use("/api/v1/talent", talentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/event", eventRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/unregisteredAttendance", unregisteredAttendanceRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/like", likeRoutes);
app.use("/api/v1/comment", commentRoutes);

app.use(errorHandler);

export { app };
