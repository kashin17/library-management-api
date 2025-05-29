// swagger.js - Swagger configuration file
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
        url: process.env.BASE_URL || 'http://localhost:3000',
        description: 'Development server',
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
  explorer: true,
  swaggerOptions: {
    url: '/swagger.json', // We'll serve the JSON separately
    persistAuthorization: true,
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .scheme-container { background: none; box-shadow: none; }
  `,
  customSiteTitle: 'Library Management API',
  customfavIcon: '/favicon.ico',
};

module.exports = {
  swaggerUi,
  specs,
  swaggerOptions,
};