require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const bookRoutes = require('./routes/bookRoutes');
const logger = require('./middleware/logger');
const limiter = require('./middleware/rateLimiter');
const connectDB = require('./config/db');

// Only import swagger specs (not the UI)
const { specs } = require('./swagger');

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Security headers middleware - optimized for Vercel Swagger UI
app.use((req, res, next) => {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Very permissive CSP specifically for Swagger UI on Vercel
  if (req.path.startsWith('/api-docs')) {
    res.setHeader('Content-Security-Policy', 
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
      "script-src * 'unsafe-inline' 'unsafe-eval'; " +
      "style-src * 'unsafe-inline'; " +
      "img-src * data: blob:; " +
      "font-src * data:; " +
      "connect-src *; " +
      "frame-src *;"
    );
  }
  next();
});

// CORS configuration
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(logger);
app.use(limiter);

connectDB();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve Swagger JSON
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  res.json(specs);
});

// Custom Swagger UI route that works reliably on Vercel
app.get('/api-docs', (req, res) => {
  const swaggerHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Library Management API Documentation</title>
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
      <style>
        html {
          box-sizing: border-box;
          overflow: -moz-scrollbars-vertical;
          overflow-y: scroll;
        }
        *, *:before, *:after {
          box-sizing: inherit;
        }
        body {
          margin:0;
          background: #fafafa;
        }
        .swagger-ui .topbar {
          display: none;
        }
        #swagger-ui {
          max-width: 1200px;
          margin: 0 auto;
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          font-size: 18px;
          color: #3b4151;
        }
      </style>
    </head>
    <body>
      <div id="swagger-ui">
        <div class="loading">Loading API Documentation...</div>
      </div>
      
      <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          try {
            console.log('Initializing Swagger UI...');
            const ui = SwaggerUIBundle({
              url: window.location.origin + '/swagger.json',
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout",
              validatorUrl: null,
              tryItOutEnabled: true,
              supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
              onComplete: function() {
                console.log('Swagger UI loaded successfully');
              },
              onFailure: function(data) {
                console.error('Swagger UI failed to load:', data);
                document.getElementById('swagger-ui').innerHTML = 
                  '<div style="padding: 20px; text-align: center;">' +
                  '<h2>Failed to load API documentation</h2>' +
                  '<p>Error: ' + JSON.stringify(data) + '</p>' +
                  '<p><a href="/swagger.json">View raw API specification</a></p>' +
                  '</div>';
              }
            });
          } catch (error) {
            console.error('Error initializing Swagger UI:', error);
            document.getElementById('swagger-ui').innerHTML = 
              '<div style="padding: 20px; text-align: center;">' +
              '<h2>Error loading Swagger UI</h2>' +
              '<p>' + error.message + '</p>' +
              '<p><a href="/swagger.json">View raw API specification</a></p>' +
              '</div>';
          }
        };
      </script>
    </body>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(swaggerHtml);
});

// Routes
app.use('/books', bookRoutes);

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



// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;



// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const morgan = require('morgan');
// const bookRoutes = require('./routes/bookRoutes');
// const logger = require('./middleware/logger');
// const limiter = require('./middleware/rateLimiter');
// const connectDB = require('./config/db');

// const { swaggerUi, specs, swaggerOptions } = require('./swagger');

// const app = express();

// // Trust proxy for Vercel
// app.set('trust proxy', 1);


// // Security headers middleware - simplified for Vercel
// app.use((req, res, next) => {
//   // Basic security headers
//   res.setHeader('X-Content-Type-Options', 'nosniff');
//   res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Changed from DENY to SAMEORIGIN for Swagger
//   res.setHeader('X-XSS-Protection', '1; mode=block');
  
//   // More permissive CSP for Swagger UI on Vercel
//   if (req.path.startsWith('/api-docs')) {
//     res.setHeader('Content-Security-Policy', 
//       "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
//       "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
//       "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
//       "font-src 'self' https://fonts.gstatic.com data:; " +
//       "img-src 'self' data: https: blob:; " +
//       "connect-src 'self' https:; " +
//       "frame-src 'self';"
//     );
//   }
//   next();
// });



// // // Middlewares
// // CORS configuration
// app.use(cors({
//   origin: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
//   credentials: false
// }));
// // app.use(express.json());
// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // app.use(morgan('dev'));
// // Logging middleware (only in development to avoid Vercel function timeouts)
// if (process.env.NODE_ENV !== 'production') {
//   app.use(morgan('dev'));
// }
// app.use(logger);
// app.use(limiter);


// connectDB();

// // Health check endpoint (useful for Vercel)
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'OK', 
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // // Swagger Documentation
// // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
// //   explorer: true,
// //   customCss: '.swagger-ui .topbar { display: none }',
// //   customSiteTitle: 'Library Management API',
// // }));

// // Serve Swagger JSON - this is critical for Vercel
// app.get('/swagger.json', (req, res) => {
//   res.setHeader('Content-Type', 'application/json');
//   res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
//   res.json(specs);
// });

// // Alternative JSON endpoint for debugging
// app.get('/api-docs-json', (req, res) => {
//   res.setHeader('Content-Type', 'application/json');
//   res.json(specs);
// });

// // // Swagger Documentation with Vercel-optimized settings
// // app.use('/api-docs', swaggerUi.serveFiles(specs), swaggerUi.setup(specs, {
// //   ...swaggerOptions,
// //   swaggerOptions: {
// //     ...swaggerOptions.swaggerOptions,
// //     // Use relative URL for Vercel
// //     url: '/swagger.json',
// //   }
// // }));

// // Swagger UI setup with better error handling
// try {
//   // Initialize Swagger UI with specs directly
//   const swaggerSetup = swaggerUi.setup(specs, {
//     ...swaggerOptions,
//     swaggerOptions: {
//       ...swaggerOptions.swaggerOptions,
//       url: undefined, // Don't use external URL, use inline specs
//       spec: specs, // Provide specs directly
//     }
//   });

//   // Serve static Swagger files
//   app.use('/api-docs', swaggerUi.serve);
  
//   // Setup Swagger UI
//   app.get('/api-docs', (req, res, next) => {
//     // Add additional headers for Swagger UI
//     res.setHeader('X-Frame-Options', 'SAMEORIGIN');
//     swaggerSetup(req, res, next);
//   });

//   console.log('Swagger UI initialized successfully');
// } catch (error) {
//   console.error('Error initializing Swagger UI:', error);
  
//   // Fallback: serve basic API documentation
//   app.get('/api-docs', (req, res) => {
//     res.json({
//       message: 'Swagger UI initialization failed',
//       error: error.message,
//       documentation: specs,
//       endpoints: {
//         books: '/books',
//         search: '/books/search',
//         swagger_json: '/swagger.json'
//       }
//     });
//   });
// }





// // Routes
// app.use('/books', bookRoutes); // e.g., /books/, /books/:id, /books/search

// // Root endpoint
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Library Management API',
//     documentation: '/api-docs',
//     swagger_json: '/swagger.json',
//     health: '/health',
//     version: '1.0.0',
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // 404 handler
// // app.use('*', (req, res) => {
// //   res.status(404).json({ 
// //     message: 'Route not found',
// //     path: req.originalUrl,
// //     available_routes: [
// //       '/',
// //       '/health',
// //       '/api-docs',
// //       '/swagger.json',
// //       '/books',
// //       '/books/search'
// //     ]
// //   });
// // });

// // Global error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err.stack);
  
//   // Don't leak error details in production
//   const isDevelopment = process.env.NODE_ENV !== 'production';
  
//   res.status(err.status || 500).json({
//     message: err.message || 'Something went wrong!',
//     ...(isDevelopment && { stack: err.stack }),
//     timestamp: new Date().toISOString()
//   });
// });

// // // Root endpoint
// // app.get('/', (req, res) => {
// //   res.json({
// //     message: 'Library Management API',
// //     documentation: '/api-docs',
// //     version: '1.0.0'
// //   });
// // });

// // // 404 handler
// // app.use('*', (req, res) => {
// //   res.status(404).json({ message: 'Route not found' });
// // });

// // // Error handling middleware
// // app.use((err, req, res, next) => {
// //   console.error(err.stack);
// //   res.status(500).json({ message: 'Something went wrong!' });
// // });

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
// module.exports = app;