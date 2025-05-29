require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const bookRoutes = require('./routes/bookRoutes');
const logger = require('./middleware/logger');
const limiter = require('./middleware/rateLimiter');
const connectDB = require('./config/db');

const { swaggerUi, specs, swaggerOptions } = require('./swagger');

const app = express();


// Add security headers for Vercel
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Allow Swagger UI assets
  if (req.path.startsWith('/api-docs')) {
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self';"
    );
  }
  next();
});



// // Middlewares
// app.use(cors());
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(logger);
app.use(limiter);


connectDB();


// // Swagger Documentation
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
//   explorer: true,
//   customCss: '.swagger-ui .topbar { display: none }',
//   customSiteTitle: 'Library Management API',
// }));

// Serve Swagger JSON separately (helps with Vercel)
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Alternative: Serve raw JSON documentation for testing
app.get('/api-docs-json', (req, res) => {
  res.json(specs);
});

// Swagger Documentation with Vercel-optimized settings
app.use('/api-docs', swaggerUi.serveFiles(specs), swaggerUi.setup(specs, {
  ...swaggerOptions,
  swaggerOptions: {
    ...swaggerOptions.swaggerOptions,
    // Use relative URL for Vercel
    url: '/swagger.json',
  }
}));



// Routes
app.use('/books', bookRoutes); // e.g., /books/, /books/:id, /books/search


// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Library Management API',
    documentation: '/api-docs',
    version: '1.0.0'
  });
});

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;