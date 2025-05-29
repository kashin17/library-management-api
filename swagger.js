// swagger.js - Swagger configuration file optimized for Vercel
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Management API',
      version: '1.0.0',
      description: 'A simple library management system API with CRUD operations and fuzzy search',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? (process.env.BASE_URL || 'https://your-app.vercel.app')
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      schemas: {
        Book: {
          type: 'object',
          required: ['title', 'author', 'genre', 'publishedYear', 'ISBN', 'stockCount'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ObjectId',
            },
            title: {
              type: 'string',
              description: 'Title of the book',
            },
            author: {
              type: 'string',
              description: 'Author of the book',
            },
            genre: {
              type: 'string',
              description: 'Genre of the book',
            },
            publishedYear: {
              type: 'number',
              description: 'Year the book was published',
            },
            ISBN: {
              type: 'string',
              description: 'Unique ISBN number',
            },
            stockCount: {
              type: 'number',
              description: 'Number of copies available',
            },
          },
        },
        BookInput: {
          type: 'object',
          required: ['title', 'author', 'genre', 'publishedYear', 'ISBN', 'stockCount'],
          properties: {
            title: {
              type: 'string',
              description: 'Title of the book',
            },
            author: {
              type: 'string',
              description: 'Author of the book',
            },
            genre: {
              type: 'string',
              description: 'Genre of the book',
            },
            publishedYear: {
              type: 'number',
              description: 'Year the book was published',
            },
            ISBN: {
              type: 'string',
              description: 'Unique ISBN number',
            },
            stockCount: {
              type: 'number',
              description: 'Number of copies available',
            },
          },
        },
        PaginatedBooks: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Total number of books',
            },
            page: {
              type: 'number',
              description: 'Current page number',
            },
            pages: {
              type: 'number',
              description: 'Total number of pages',
            },
            books: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Book',
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
              },
              description: 'Validation error details',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/bookRoutes.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

// Vercel-optimized Swagger UI options
const swaggerOptions = {
  explorer: false,
  swaggerOptions: {
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      'SwaggerUIBundle.presets.apis',
      'SwaggerUIBundle.presets.standalone'
    ],
    plugins: [
      'SwaggerUIBundle.plugins.DownloadUrl'
    ],
    layout: "StandaloneLayout",
    validatorUrl: null, // Disable external validator
    tryItOutEnabled: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    displayOperationId: false,
    showMutatedRequest: true,
    defaultModelRendering: 'example',
    defaultModelExpandDepth: 1,
    defaultModelsExpandDepth: 1,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    // Disable problematic features for Vercel
    oauth2RedirectUrl: undefined,
    showRequestHeaders: true,
    // Add error handling
    onComplete: function() {
      console.log('Swagger UI loaded successfully');
    },
    onFailure: function(data) {
      console.error('Swagger UI failed to load:', data);
    }
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .scheme-container { 
      background: none; 
      box-shadow: none; 
    }
    .swagger-ui .info {
      margin: 50px 0;
    }
    .swagger-ui .info .title {
      font-size: 36px;
      color: #3b4151;
    }
    /* Add loading indicator styles */
    .swagger-ui .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      font-size: 18px;
      color: #3b4151;
    }
  `,
  customSiteTitle: 'Library Management API Documentation',
  // Add custom JavaScript for better error handling
  customJs: `
    console.log('Swagger UI custom JS loaded');
    
    // Add loading indicator
    document.addEventListener('DOMContentLoaded', function() {
      const swaggerContainer = document.getElementById('swagger-ui');
      if (swaggerContainer && !swaggerContainer.hasChildNodes()) {
        swaggerContainer.innerHTML = '<div class="loading-container">Loading API Documentation...</div>';
      }
      
      // Check if SwaggerUIBundle is available
      if (typeof SwaggerUIBundle === 'undefined') {
        console.error('SwaggerUIBundle is not available');
        if (swaggerContainer) {
          swaggerContainer.innerHTML = '<div style="padding: 20px; text-align: center;"><h2>Unable to load Swagger UI</h2><p>Please refresh the page or check your internet connection.</p></div>';
        }
      }
    });
    
    // Add error handling for network issues
    window.addEventListener('error', function(e) {
      console.error('JavaScript error:', e.error);
    });
    
    window.addEventListener('unhandledrejection', function(e) {
      console.error('Unhandled promise rejection:', e.reason);
    });
  `
};

module.exports = {
  swaggerUi,
  specs,
  swaggerOptions,
};





// // swagger.js - Swagger configuration file
// const swaggerJsdoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express');

// const options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Library Management API',
//       version: '1.0.0',
//       description: 'A simple library management system API with CRUD operations and fuzzy search',
//     },
//     servers: [
//       {
//         url: process.env.NODE_ENV === 'production' 
//           ? process.env.BASE_URL 
//           : 'http://localhost:3000',
//         description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
//       },
//     ],
//     components: {
//       schemas: {
//         Book: {
//           type: 'object',
//           required: ['title', 'author', 'genre', 'publishedYear', 'ISBN', 'stockCount'],
//           properties: {
//             _id: {
//               type: 'string',
//               description: 'Auto-generated MongoDB ObjectId',
//             },
//             title: {
//               type: 'string',
//               description: 'Title of the book',
//             },
//             author: {
//               type: 'string',
//               description: 'Author of the book',
//             },
//             genre: {
//               type: 'string',
//               description: 'Genre of the book',
//             },
//             publishedYear: {
//               type: 'number',
//               description: 'Year the book was published',
//             },
//             ISBN: {
//               type: 'string',
//               description: 'Unique ISBN number',
//             },
//             stockCount: {
//               type: 'number',
//               description: 'Number of copies available',
//             },
//           },
//         },
//         BookInput: {
//           type: 'object',
//           required: ['title', 'author', 'genre', 'publishedYear', 'ISBN', 'stockCount'],
//           properties: {
//             title: {
//               type: 'string',
//               description: 'Title of the book',
//             },
//             author: {
//               type: 'string',
//               description: 'Author of the book',
//             },
//             genre: {
//               type: 'string',
//               description: 'Genre of the book',
//             },
//             publishedYear: {
//               type: 'number',
//               description: 'Year the book was published',
//             },
//             ISBN: {
//               type: 'string',
//               description: 'Unique ISBN number',
//             },
//             stockCount: {
//               type: 'number',
//               description: 'Number of copies available',
//             },
//           },
//         },
//         PaginatedBooks: {
//           type: 'object',
//           properties: {
//             total: {
//               type: 'number',
//               description: 'Total number of books',
//             },
//             page: {
//               type: 'number',
//               description: 'Current page number',
//             },
//             pages: {
//               type: 'number',
//               description: 'Total number of pages',
//             },
//             books: {
//               type: 'array',
//               items: {
//                 $ref: '#/components/schemas/Book',
//               },
//             },
//           },
//         },
//         Error: {
//           type: 'object',
//           properties: {
//             message: {
//               type: 'string',
//               description: 'Error message',
//             },
//             details: {
//               type: 'array',
//               items: {
//                 type: 'object',
//               },
//               description: 'Validation error details',
//             },
//           },
//         },
//       },
//     },
//   },
//   apis: ['./routes/bookRoutes.js'], // Path to the API docs
// };

// const specs = swaggerJsdoc(options);

// // Vercel-optimized Swagger UI options
// const swaggerOptions = {
//   explorer: false, // Set to false for better Vercel compatibility
//   swaggerOptions: {
//     persistAuthorization: true,
//     displayRequestDuration: true,
//     docExpansion: 'list',
//     filter: true,
//     showExtensions: true,
//     showCommonExtensions: true,
//     tryItOutEnabled: true,
//     debug: true
//   },
//   customCss: `
//     .swagger-ui .topbar { display: none }
//     .swagger-ui .scheme-container { 
//       background: none; 
//       box-shadow: none; 
//     }
//     .swagger-ui .info {
//       margin: 50px 0;
//     }
//     .swagger-ui .info .title {
//       font-size: 36px;
//       color: #3b4151;
//     }
//   `,
//   customSiteTitle: 'Library Management API Documentation',
//   // customfavIcon: '/favicon.ico',
//   // customJs: '/swagger-custom.js', // We'll create this if needed
// };

// module.exports = {
//   swaggerUi,
//   specs,
//   swaggerOptions,
// };


























// // swagger.js - Swagger configuration file
// const swaggerJsdoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express');

// const options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Library Management API',
//       version: '1.0.0',
//       description: 'A simple library management system API with CRUD operations and fuzzy search',
//     },
//     servers: [
//       {
//         url: process.env.BASE_URL || 'http://localhost:3000',
//         description: 'Development server',
//       },
//     ],
//     components: {
//       schemas: {
//         Book: {
//           type: 'object',
//           required: ['title', 'author', 'genre', 'publishedYear', 'ISBN', 'stockCount'],
//           properties: {
//             _id: {
//               type: 'string',
//               description: 'Auto-generated MongoDB ObjectId',
//             },
//             title: {
//               type: 'string',
//               description: 'Title of the book',
//             },
//             author: {
//               type: 'string',
//               description: 'Author of the book',
//             },
//             genre: {
//               type: 'string',
//               description: 'Genre of the book',
//             },
//             publishedYear: {
//               type: 'number',
//               description: 'Year the book was published',
//             },
//             ISBN: {
//               type: 'string',
//               description: 'Unique ISBN number',
//             },
//             stockCount: {
//               type: 'number',
//               description: 'Number of copies available',
//             },
//           },
//         },
//         BookInput: {
//           type: 'object',
//           required: ['title', 'author', 'genre', 'publishedYear', 'ISBN', 'stockCount'],
//           properties: {
//             title: {
//               type: 'string',
//               description: 'Title of the book',
//             },
//             author: {
//               type: 'string',
//               description: 'Author of the book',
//             },
//             genre: {
//               type: 'string',
//               description: 'Genre of the book',
//             },
//             publishedYear: {
//               type: 'number',
//               description: 'Year the book was published',
//             },
//             ISBN: {
//               type: 'string',
//               description: 'Unique ISBN number',
//             },
//             stockCount: {
//               type: 'number',
//               description: 'Number of copies available',
//             },
//           },
//         },
//         PaginatedBooks: {
//           type: 'object',
//           properties: {
//             total: {
//               type: 'number',
//               description: 'Total number of books',
//             },
//             page: {
//               type: 'number',
//               description: 'Current page number',
//             },
//             pages: {
//               type: 'number',
//               description: 'Total number of pages',
//             },
//             books: {
//               type: 'array',
//               items: {
//                 $ref: '#/components/schemas/Book',
//               },
//             },
//           },
//         },
//         Error: {
//           type: 'object',
//           properties: {
//             message: {
//               type: 'string',
//               description: 'Error message',
//             },
//             details: {
//               type: 'array',
//               items: {
//                 type: 'object',
//               },
//               description: 'Validation error details',
//             },
//           },
//         },
//       },
//     },
//   },
//   apis: ['./routes/bookRoutes.js'], // Path to the API docs
  
// };

// const specs = swaggerJsdoc(options);

// // Vercel-optimized Swagger UI options
// const swaggerOptions = {
//   explorer: true,
//   swaggerOptions: {
//     url: '/swagger.json', // We'll serve the JSON separately
//     persistAuthorization: true,
//   },
//   customCss: `
//     .swagger-ui .topbar { display: none }
//     .swagger-ui .scheme-container { background: none; box-shadow: none; }
//   `,
//   customSiteTitle: 'Library Management API',
//   customfavIcon: '/favicon.ico',
// };

// module.exports = {
//   swaggerUi,
//   specs,
//   swaggerOptions,
// };