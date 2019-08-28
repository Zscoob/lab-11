'use strict';

const express = require('express');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));

app.set('view engine', 'ejs');

app.get('/', (request, response) => { 
  response.render('pages/index');
});

app.post('/searches', createSearch);

app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
let httpRegex = /^(http:\/\/)/g;

function Book(info) {
  this.author = info.volumeInfo.authors;
  this.title = info.volumeInfo.title;
  this.description = info.volumeInfo.description;
  this.image_url = info.volumeInfo.imageLinks ? info.volumeInfo.imageLinks.smallThumbnail.replace(httpRegex, 'https://') : placeholderImage;
  this.isbn = info.volumeInfo.industryIdentifiers[0].identifier;
  this.bookshelf = userInputOfSomeSort;
}

Book.prototype.save = function(){
  const SQL = `INSERT INTO books (author, title, isbn, image_url, description, bookshelf) VALUES($1, $2, $3, $4, $5, $6);`;
  const VALUES = [this.id, this.author, this.title, this.isbn, this.image_url, this.description, this.bookshelf];
  client.query(SQL, VALUES);
}

function createSearch(request, response){
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body);
  console.log(request.body.search);

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => {
      console.log(bookResult)
      return new Book(bookResult)
    }))
    .then(results => response.render('pages/searches/show', {searchResults: results}))
    .catch(error => {
      response.render('pages/error')
    })
}
