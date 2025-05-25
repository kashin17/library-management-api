const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  publishedYear: { type: Number, required: true },
  ISBN: { type: String, required: true, unique: true },
  stockCount: { type: Number, required: true },
}, {
  timestamps: true // Optional: adds createdAt and updatedAt
});

// Add text index for search optimization
bookSchema.index({ 
  title: 'text', 
  author: 'text', 
  genre: 'text' 
});

// Add individual indexes for common queries
bookSchema.index({ ISBN: 1 }); // Already unique, but explicit index
bookSchema.index({ genre: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ publishedYear: 1 });

module.exports = mongoose.model('Book', bookSchema);


// const mongoose = require('mongoose');

// const bookSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   author: { type: String, required: true },
//   genre: { type: String, required: true },
//   publishedYear: { type: Number, required: true },
//   ISBN: { type: String, required: true, unique: true },
//   stockCount: { type: Number, required: true },
// });

// module.exports = mongoose.model('Book', bookSchema);
