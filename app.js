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

// Trust proxy for Vercel
app.set('trust proxy', 1);


// Security headers middleware - simplified for Vercel
app.use((req, res, next) => {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Changed from DENY to SAMEORIGIN for Swagger
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // More permissive CSP for Swagger UI on Vercel
  if (req.path.startsWith('/api-docs')) {
    res.setHeader('Content-Security-Policy', 
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
      "font-src 'self' https://fonts.gstatic.com data:; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https:; " +
      "frame-src 'self';"
    );
  }
  next();
});



// // Middlewares
// CORS configuration
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false
}));
// app.use(express.json());
// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// app.use(morgan('dev'));
// Logging middleware (only in development to avoid Vercel function timeouts)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(logger);
app.use(limiter);


connectDB();

// Health check endpoint (useful for Vercel)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// // Swagger Documentation
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
//   explorer: true,
//   customCss: '.swagger-ui .topbar { display: none }',
//   customSiteTitle: 'Library Management API',
// }));

// Serve Swagger JSON - this is critical for Vercel
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.json(specs);
});

// Alternative JSON endpoint for debugging
app.get('/api-docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(specs);
});

// // Swagger Documentation with Vercel-optimized settings
// app.use('/api-docs', swaggerUi.serveFiles(specs), swaggerUi.setup(specs, {
//   ...swaggerOptions,
//   swaggerOptions: {
//     ...swaggerOptions.swaggerOptions,
//     // Use relative URL for Vercel
//     url: '/swagger.json',
//   }
// }));

// Swagger UI setup with better error handling
try {
  // Initialize Swagger UI with specs directly
  const swaggerSetup = swaggerUi.setup(specs, {
    ...swaggerOptions,
    swaggerOptions: {
      ...swaggerOptions.swaggerOptions,
      url: undefined, // Don't use external URL, use inline specs
      spec: specs, // Provide specs directly
    }
  });

  // Serve static Swagger files
  app.use('/api-docs', swaggerUi.serve);
  
  // Setup Swagger UI
  app.get('/api-docs', (req, res, next) => {
    // Add additional headers for Swagger UI
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    swaggerSetup(req, res, next);
  });

  console.log('Swagger UI initialized successfully');
} catch (error) {
  console.error('Error initializing Swagger UI:', error);
  
  // Fallback: serve basic API documentation
  app.get('/api-docs', (req, res) => {
    res.json({
      message: 'Swagger UI initialization failed',
      error: error.message,
      documentation: specs,
      endpoints: {
        books: '/books',
        search: '/books/search',
        swagger_json: '/swagger.json'
      }
    });
  });
}





// Routes
app.use('/books', bookRoutes); // e.g., /books/, /books/:id, /books/search

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Library Management API',
    documentation: '/api-docs',
    swagger_json: '/swagger.json',
    health: '/health',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ 
//     message: 'Route not found',
//     path: req.originalUrl,
//     available_routes: [
//       '/',
//       '/health',
//       '/api-docs',
//       '/swagger.json',
//       '/books',
//       '/books/search'
//     ]
//   });
// });

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// // Root endpoint
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Library Management API',
//     documentation: '/api-docs',
//     version: '1.0.0'
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Something went wrong!' });
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
module.exports = app;