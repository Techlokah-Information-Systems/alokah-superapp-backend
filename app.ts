import express from "express";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import { API_BASE_PATH } from "./utils/constants";
import errorHandler from "./middleware/errorHandler";
import swaggerUi from "swagger-ui-express";
import { swaggerDoc } from "./utils/swagger";

// Routes
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import hotelRoutes from "./routes/hotel.routes";
import inventoryRoutes from "./routes/inventory.routes";
import employeeRoutes from "./routes/employee.routes";
import alokahRoutes from "./routes/alokah.routes";

const app = express();

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => req.path.includes("/alokah/search-inventory"),
});

const relaxedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(`${API_BASE_PATH}/alokah/search-inventory`, relaxedLimiter);

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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use(`${API_BASE_PATH}/user`, userRoutes);
app.use(`${API_BASE_PATH}/auth`, authRoutes);
app.use(`${API_BASE_PATH}/hotel`, hotelRoutes);
app.use(`${API_BASE_PATH}/inventory`, inventoryRoutes);
app.use(`${API_BASE_PATH}/employee`, employeeRoutes);
app.use(`${API_BASE_PATH}/alokah`, alokahRoutes);

app.use(errorHandler);
export default app;
