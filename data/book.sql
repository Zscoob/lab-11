DROP TABLE IF EXISTS books

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
	isbn VARCHAR(255),
	image_url VARCHAR(255),
  description VAR(1000),
  bookshelf VAR(255)
);










