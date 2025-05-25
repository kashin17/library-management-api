const Fuse = require('fuse.js');

const fuzzySearch = (books, query) => {
  const options = {
    keys: ['title', 'author', 'genre'],
    threshold: 0.4,
    ignoreLocation: true
  };
  const fuse = new Fuse(books, options);
  return fuse.search(query).map(result => result.item);
};

module.exports = fuzzySearch;
