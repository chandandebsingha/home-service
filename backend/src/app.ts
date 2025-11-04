import express from "express";
import cors from "cors";
import { config } from "./types/config";
import authRoutes from "./routes/auth.routes";
import { errorHandler, jsonErrorHandler } from "./middleware/error.middleware";
import servicesRoutes from "./routes/services.routes";
import categoriesRoutes from "./routes/categories.routes";
import bookingsRoutes from "./routes/bookings.routes";
import addressesRoutes from "./routes/addresses.routes";
import adminRoutes from "./routes/admin.routes";
import providerRoutes from "./routes/provider.routes";
import partnerRoutes from "./routes/partner.routes";
import occupationRoutes from "./routes/occupation.routes";
import serviceTypesRoutes from "./routes/serviceTypes.routes";
import publicRoutes from "./routes/public.routes";
import reviewsRoutes from "./routes/reviews.routes";

const app = express();

// Middleware
app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests from Expo Go (no origin) and known dev origins
			const allowed = [
				"http://localhost:8081",
				"http://localhost:8082",
				"http://localhost:19006",
				"http://localhost:3000",
			];
			if (!origin) return callback(null, true); // mobile fetch often has no Origin
			if (
				allowed.includes(origin) ||
				origin.startsWith("exp://") ||
				/http:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?/.test(origin)
			) {
				return callback(null, true);
			}
			return callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Accept"],
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JSON parsing error handler (must be before routes)
app.use(jsonErrorHandler);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/addresses", addressesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/occupations", occupationRoutes);
app.use("/api/service-types", serviceTypesRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/reviews", reviewsRoutes);

// Health check
app.get("/", (req, res) => {
	res.json({
		success: true,
		message: "Server is running",
		timestamp: new Date().toISOString(),
	});
});

// Also respond on /api so clients that probe the API base (e.g. GET /api/)
// don't receive a 404 when checking connectivity.
app.get("/api", (req, res) => {
	res.json({
		success: true,
		message: "API is available",
		timestamp: new Date().toISOString(),
	});
});

// Conventional health endpoint used by many PaaS health checks
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
