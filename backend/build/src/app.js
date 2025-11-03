"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const services_routes_1 = __importDefault(require("./routes/services.routes"));
const categories_routes_1 = __importDefault(require("./routes/categories.routes"));
const bookings_routes_1 = __importDefault(require("./routes/bookings.routes"));
const addresses_routes_1 = __importDefault(require("./routes/addresses.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const provider_routes_1 = __importDefault(require("./routes/provider.routes"));
const partner_routes_1 = __importDefault(require("./routes/partner.routes"));
const occupation_routes_1 = __importDefault(require("./routes/occupation.routes"));
const serviceTypes_routes_1 = __importDefault(require("./routes/serviceTypes.routes"));
const public_routes_1 = __importDefault(require("./routes/public.routes"));
const reviews_routes_1 = __importDefault(require("./routes/reviews.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowed = [
            "http://localhost:8081",
            "http://localhost:8082",
            "http://localhost:19006",
            "http://localhost:3000",
        ];
        if (!origin)
            return callback(null, true);
        if (allowed.includes(origin) ||
            origin.startsWith("exp://") ||
            /http:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?/.test(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(error_middleware_1.jsonErrorHandler);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/services", services_routes_1.default);
app.use("/api/categories", categories_routes_1.default);
app.use("/api/bookings", bookings_routes_1.default);
app.use("/api/addresses", addresses_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/provider", provider_routes_1.default);
app.use("/api/partner", partner_routes_1.default);
app.use("/api/occupations", occupation_routes_1.default);
app.use("/api/service-types", serviceTypes_routes_1.default);
app.use("/api/public", public_routes_1.default);
app.use("/api/reviews", reviews_routes_1.default);
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
    });
});
app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "API is available",
        timestamp: new Date().toISOString(),
    });
});
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map