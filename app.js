require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const bookRoutes = require('./routes/bookRoutes');
const logger = require('./middleware/logger');
const limiter = require('./middleware/rateLimiter');
const connectDB = require('./config/db');

const { swaggerUi, specs } = require('./swagger');

const app = express();

// // Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(logger);
app.use(limiter);


connectDB();


// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Library Management API',
}));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Library Management API',
    documentation: '/api-docs',
    version: '1.0.0'
  });
});

// Routes
app.use('/books', bookRoutes); // e.g., /books/, /books/:id, /books/search

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