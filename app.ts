import express from "express";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import { API_BASE_PATH } from "./utils/constants";

// Routes
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";

const app = express();

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);
app.use(express.json());
app.use(cors());
app.options(/.*/, cors());

app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "Alokah Superapp API is Running",
    version: "1.0.0",
    endpoints: {},
  });
});

app.use(`${API_BASE_PATH}/user`, userRoutes);
app.use(`${API_BASE_PATH}/auth`, authRoutes);

export default app;
