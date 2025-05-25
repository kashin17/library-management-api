// dtos/book.dto.js
const Joi = require('joi');

const createBookDto = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  genre: Joi.string().required(),
  publishedYear: Joi.number().required(),
  ISBN: Joi.string().required(),
  stockCount: Joi.number().required()
});

const updateBookDto = Joi.object({
  title: Joi.string(),
  author: Joi.string(),
  genre: Joi.string(),
  publishedYear: Joi.number(),
  ISBN: Joi.string(),
  stockCount: Joi.number()
});

module.exports = { createBookDto, updateBookDto };