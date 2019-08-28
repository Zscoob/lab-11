DROP TABLE IF EXISTS books

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
	isbn VARCHAR(255),
	image_url VARCHAR(255),
  description VARCHAR(1000),
  bookshelf VAR(255)
);

INSERT INTO books (author, title, isbn, image_url, description, bookshelf) VALUES('thingy', 'info', 'stuff', 'oogabooga', 'something', 'some stuff');