'use strict';

require('dotenv').config();

const express = require('express');
const pg = require('pg');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT || 3000;

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', error => console.error(error));

app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));

app.set('view engine', 'ejs');

app.get('/', getBooks);
app.post('/searches', createSearch);
app.get('/searches/new', newSearch);
app.post('/books', createBook);
app.get('/books/:id', getBook);

app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg'; 
let httpRegex = /^(http:)/g;

function Book(info) {
  this.author = info.authors;
  this.title = info.title;
  this.description = info.description;
  this.image_url = info.imageLinks ? info.imageLinks.smallThumbnail.replace(httpRegex, 'https:') : placeholderImage;
  this.isbn = `ISBN_13 ${info.industryIdentifiers[0].identifier}`;
};

function getBooks(request, response){
  let SQL = `SELECT * FROM books`;

  return client.query(SQL)
    .then(results => {
      if(results.rows.rowCount === 0){
        response.render('pages/searches/new');
      } else {
        response.render('pages/index', { books: results.rows });
      }
    })
    .catch(error => {
      response.render('pages/error');
      console.log(error);
    });
}

function createSearch(request, response){
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body);
  console.log(request.body.search);

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
  
  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => {
      console.log(bookResult);
      return new Book(bookResult.volumeInfo);
    }))
    .then(results => response.render('pages/searches/show', {searchResults: results}))
    .catch(error => {
      response.render('pages/error');
      console.log(error);
    });
}

function newSearch(request, response){
  response.render('pages/searches/new');
}

function createBook(request, response){
  let normalizedShelf = request.body.bookshelf.toLowerCase();

  let {title, author, isbn, image_url, description} = request.body;
  let SQL = `INSERT INTO books(title, author, isbn, image_url, description, bookshelf) VALUES($1, $2, $3, $4, $5, $6);`;
  let VALUES = [title, author, isbn, image_url, description, normalizedShelf];

  return client.query(SQL, VALUES)
    .then(() => {
      SQL = `SELECT * FROM books WHERE isbn=$1;`;
      VALUES = [request.body.isbn];
      return client.query(SQL, VALUES)
        .then(result => response.redirect(`/books/${result.rows[0].id}`))
        .catch(error => {
          response.render('pages/error');
          console.log(error);
        });
    });
}

function getBook(request, response) {
  getBookshelves()
    .then(shelves => {
      let SQL = `SELECT * FROM books WHERE id=$1;`;
      let VALUES = [request.params.id];
      client.query(SQL, VALUES)
        .then(result => response.render('pages/books/show', {book: result.rows[0], bookshelves: shelves.rows}))
        .catch(error => {
          response.render('pages/error');
          console.log(error);
        });
    });
}

function getBookshelves(){
  let SQL = `SELECT DISTINCT bookshelf FROM books ORDER BY bookshelf;`;

  return client.query(SQL);
}