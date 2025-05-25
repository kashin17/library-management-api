# 📚 Book Management API

A RESTful API built with **Node.js**, **Express**, and **MongoDB**, designed to manage a library of books. Features include CRUD operations, pagination, fuzzy search, input validation with Joi, rate limiting, and OpenAPI (Swagger) documentation.

---

##  Features

- Create, Read, Update, Delete (CRUD) books
- Fuzzy search by `title`, `author`, or `genre`
- MongoDB text index + fallback fuzzy search
- Input validation using **Joi DTOs**
- Rate limiting middleware for basic protection
- Modular code structure with DTOs, middlewares, and utils
- API documentation with **Swagger**

---



## 🧾 API Documentation

 Swagger UI: [`/api-docs`](http://localhost:3000/api-docs)



##  Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- Joi (DTO validation)
- Swagger (OpenAPI docs)
- Rate Limiting
- dotenv

---

##  Project Structure

├── controllers/
├── dtos/
├── middleware/
├── models/
├── routes/
├── utils/
├── config/
├── app.js
├── server.js
├── .env
└── README.md


##  Install Depenedencies
- npm install



##  Create .env File
Create a .env file at the root of your project and add the following:
- MONGO_URI = your_mongodb_connection_string


## Start the Server
- npm start



## Example Endpoints

GET /books - List all books with pagination
POST /books - Add a new book (requires JSON body)
GET /books/search?q=harry - Fuzzy search books
GET /books/:id - Get a book by ID
PUT /books/:id - Update a book
DELETE /books/:id - Delete a book