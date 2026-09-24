const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
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
