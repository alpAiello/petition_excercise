DROP TABLE signatures;
DROP TABLE users;
CREATE TABLE signatures(
    id SERIAL PRIMARY KEY UNIQUE,
    signature TEXT);
CREATE TABLE users(
    id SERIAL PRIMARY KEY UNIQUE,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    hashedPassword VARCHAR(255),
    created_at VARCHAR(255)
                 );
SELECT * FROM signatures;
SELECT * FROM users;
