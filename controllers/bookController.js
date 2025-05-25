const Book = require('../models/bookModel');
const fuzzySearch = require('../utils/fuzzySearch');
const mongoose = require('mongoose');

// Create a new book
exports.createBook = async (req,res) => {
    try{
        const newBook = new Book(req.body);
        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    }catch (err) {
        res.status(400).json({ message: err.message});
    }
};

// Get a paginated list of all books
exports.getBooks = async (req,res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page -1) * limit;

        const books = await Book.find().skip(skip).limit(limit);
        const total = await Book.countDocuments();

        res.json({
            total,
            page,
            pages: Math.ceil(total/limit),
            books
        });
    }catch (err) {
        res.status(500).json({message: err.message});
    }
};


// Get a specific book by ID
exports.getBookById = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid book ID format' });
    }

    try {
        const book = await Book.findById(id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Update a book
exports.updateBook = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid book ID format' });
    }
    try {
        const updatedBook = await Book.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
        );
        if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};



// Delete a book
exports.deleteBook = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid book ID format' });
    }
    try {
        const deletedBook = await Book.findByIdAndDelete(id);
        if (!deletedBook) return res.status(404).json({ message: 'Book not found' });
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// // Fuzzy search books by title, author, or genre
// exports.searchBooks = async (req, res) => {
//   try {
//     const keyword = req.query.q;
//     if (!keyword) return res.status(400).json({ message: 'Query string "q" is required' });

//     const allBooks = await Book.find();
    
//     const filtered = fuzzySearch(allBooks,keyword);

//     res.json(filtered);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// Tried Optimized fuzzy search books by title, author, or genre
exports.searchBooks = async (req, res) => {
  try {
    const keyword = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!keyword) return res.status(400).json({ message: 'Query string "q" is required' });

    // Hybrid approach: Use MongoDB text search first, then apply fuzzy search
    let books;
    
    // Try MongoDB text search first (faster for large datasets)
    const textSearchResults = await Book.find(
      { $text: { $search: keyword } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    if (textSearchResults.length > 0) {
      // If text search found results, use those
      books = textSearchResults;
    } else {
      // Fallback to loading all books for fuzzy search (for very fuzzy matches)
      books = await Book.find();
    }

    // Apply fuzzy search
    const fuzzyResults = fuzzySearch(books, keyword);
    
    // Apply pagination to fuzzy results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = fuzzyResults.slice(startIndex, endIndex);
    
    res.json({
      total: fuzzyResults.length,
      page,
      pages: Math.ceil(fuzzyResults.length / limit),
      books: paginatedResults
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

