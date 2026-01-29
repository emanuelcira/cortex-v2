import express from "express";
import session from "express-session";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import projectRoutes from "./routes/projects.js";
import collaborationRoutes from "./routes/collaborations.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "cortex-dev-secret-change-in-prod",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/collaborations", collaborationRoutes);

app.listen(PORT, () => {
  console.log(`Cortex server running on port ${PORT}`);
});
