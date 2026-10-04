const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://service-desk-abrxsfrv8-nehareddy0705s-projects.vercel.app',
  ...(process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim().replace(/\/$/, ''))
    : []),
];

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, or server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');

      // Check explicit allowed origins or any vercel.app deployment for this project
      const isAllowed =
        allowedOrigins.includes(normalizedOrigin) ||
        /^https:\/\/service-desk.*\.vercel\.app$/.test(normalizedOrigin) ||
        /^https:\/\/.*nehareddy0705s-projects\.vercel\.app$/.test(normalizedOrigin);

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(new Error(`CORS error: Origin ${origin} not allowed by CORS policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ServiceDesk Pro Backend',
  });
});

// Mount Main API Routes
app.use('/api', routes);

// Centralized 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
