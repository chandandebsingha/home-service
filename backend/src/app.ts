import express from 'express';
import cors from 'cors';
import { config } from './types/config';
import authRoutes from './routes/auth.routes';
import { errorHandler, jsonErrorHandler } from './middleware/error.middleware';
import servicesRoutes from './routes/services.routes';
import bookingsRoutes from './routes/bookings.routes';
import adminRoutes from './routes/admin.routes';
import providerRoutes from './routes/provider.routes';
import occupationRoutes from './routes/occupation.routes';

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from Expo Go (no origin) and known dev origins
    const allowed = [
      'http://localhost:8081',
      'http://localhost:19006',
      'http://localhost:3000',
    ];
    if (!origin) return callback(null, true); // mobile fetch often has no Origin
    if (allowed.includes(origin) || origin.startsWith('exp://') || /http:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JSON parsing error handler (must be before routes)
app.use(jsonErrorHandler);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/occupations', occupationRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
